import { Router } from 'express';
import { storage } from '../storage';
import { sendContactNotification, sendAutoReply, sendContactConfirmation, sendContactResponse, sendConsultationConfirmationEmail, sendNewsletter } from '../services/email';
import { sendConsultationBookingNotification, sendConsultationConfirmation, getServiceTypeName, getConsultationTypeName } from '../services/consultation';
import { microsoftCalendar } from '../services/microsoft-calendar';
import sanitizeHtml from 'sanitize-html';
import cache from 'memory-cache';
import { consultationBookingSchema } from '@shared/schema';

export const consultationsRoutes = Router();

const CACHE_TTL = 5 * 60 * 1000;

const getCachedServiceTypeName = (serviceType: string): string => {
  const cacheKey = `serviceType_${serviceType}`;
  let name = cache.get(cacheKey);
  if (!name) {
    name = getServiceTypeName(serviceType);
    cache.put(cacheKey, name, CACHE_TTL);
  }
  return name;
};

const getCachedConsultationTypeName = (consultationType: string): string => {
  const cacheKey = `consultationType_${consultationType}`;
  let name = cache.get(cacheKey);
  if (!name) {
    name = getConsultationTypeName(consultationType);
    cache.put(cacheKey, name, CACHE_TTL);
  }
  return name;
};

const handleCalendarOperations = async (bookingId: string, bookingData: any, startTime: Date, endTime: Date) => {
  const startTimePerf = Date.now();
  try {
    console.log(`[PERF] Starting calendar operations for booking ${bookingId}`);
    const calendarEventId = await microsoftCalendar.createEvent(bookingData);

    if (calendarEventId) {
      await storage.updateConsultationBooking(bookingId, {
        calendarEventId: calendarEventId
      });
      console.log(`✅ Calendar event created and linked: ${calendarEventId} (${Date.now() - startTimePerf}ms)`);
    }
  } catch (calendarError) {
    console.error(`❌ Calendar integration error for booking ${bookingId}:`, calendarError);
    console.log(`⚠️ Booking ${bookingId} created successfully, but calendar event creation failed`);
  }
};

const handleEmailOperations = async (bookingId: string, sanitizedData: any, validatedData: any, booking: any) => {
  const startTimePerf = Date.now();
  try {
    console.log(`[PERF] Starting email operations for booking ${bookingId}`);
    await Promise.all([
      sendConsultationBookingNotification({
        ...sanitizedData,
        company: sanitizedData.company || undefined,
      }),
      sendConsultationConfirmation(validatedData.email, validatedData.firstName, bookingId, {
        ...booking,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        company: sanitizedData.company,
        serviceType: sanitizedData.serviceType,
        preferredDate: sanitizedData.preferredDate,
        preferredTime: sanitizedData.preferredTime,
        consultationType: sanitizedData.consultationType,
        description: sanitizedData.description
      })
    ]);
    console.log(`✅ Email notifications sent for booking ${bookingId} (${Date.now() - startTimePerf}ms)`);
  } catch (emailError) {
    console.error(`❌ Email sending error for booking ${bookingId}:`, emailError);
  }
};

consultationsRoutes.post('/', async (req, res) => {
  const requestStartTime = Date.now();
  console.log(`[PERF] Starting consultation booking request`);

  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Invalid request body format"
      });
    }

    const validatedData = consultationBookingSchema.parse(req.body);

    const sanitizedData = {
      firstName: sanitizeHtml(validatedData.firstName, { allowedTags: [], allowedAttributes: {} }),
      lastName: sanitizeHtml(validatedData.lastName, { allowedTags: [], allowedAttributes: {} }),
      email: sanitizeHtml(validatedData.email, { allowedTags: [], allowedAttributes: {} }),
      phone: sanitizeHtml(validatedData.phone, { allowedTags: [], allowedAttributes: {} }),
      company: validatedData.company ? sanitizeHtml(validatedData.company, { allowedTags: [], allowedAttributes: {} }) : undefined,
      serviceType: sanitizeHtml(validatedData.serviceType, { allowedTags: [], allowedAttributes: {} }),
      preferredDate: sanitizeHtml(validatedData.preferredDate, { allowedTags: [], allowedAttributes: {} }),
      preferredTime: sanitizeHtml(validatedData.preferredTime, { allowedTags: [], allowedAttributes: {} }),
      consultationType: sanitizeHtml(validatedData.consultationType, { allowedTags: [], allowedAttributes: {} }),
      description: sanitizeHtml(validatedData.description, { allowedTags: [], allowedAttributes: {} })
    };

    if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.phone) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing or invalid after sanitization"
      });
    }

    const preferredDateObj = new Date(validatedData.preferredDate);
    if (isNaN(preferredDateObj.getTime())) {
      throw new Error('Invalid preferred date format');
    }

    const startTime = new Date(preferredDateObj);
    const timeSlot = sanitizedData.preferredTime;

    if (timeSlot.includes('morning-9')) startTime.setHours(9, 0, 0, 0);
    else if (timeSlot.includes('morning-10')) startTime.setHours(10, 0, 0, 0);
    else if (timeSlot.includes('morning-11')) startTime.setHours(11, 0, 0, 0);
    else if (timeSlot.includes('afternoon-2')) startTime.setHours(14, 0, 0, 0);
    else if (timeSlot.includes('afternoon-3')) startTime.setHours(15, 0, 0, 0);
    else if (timeSlot.includes('afternoon-4')) startTime.setHours(16, 0, 0, 0);

    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    console.log(`🔍 Checking calendar availability for ${startTime.toISOString()} to ${endTime.toISOString()}`);

    const isAvailable = await microsoftCalendar.checkAvailability(startTime, endTime);

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Selected time slot is not available. Please choose a different time."
      });
    }

    const [booking] = await Promise.all([
      storage.createConsultationBooking({
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        company: sanitizedData.company,
        serviceType: sanitizedData.serviceType,
        preferredDate: preferredDateObj,
        preferredTime: sanitizedData.preferredTime,
        consultationType: sanitizedData.consultationType,
        description: sanitizedData.description
      }),
      validatedData.newsletter ? (async () => {
        try {
          const existingSubscriber = await storage.getNewsletterSubscriber(sanitizedData.email);
          if (!existingSubscriber) {
            const newSubscriber = await storage.createNewsletterSubscriber({
              email: sanitizedData.email,
              firstName: sanitizedData.firstName,
              lastName: sanitizedData.lastName,
              source: 'consultation-form'
            });
            console.log(`✅ Added ${sanitizedData.email} to newsletter subscribers from consultation form`, newSubscriber._id);
          } else {
            console.log(`ℹ️ ${sanitizedData.email} already subscribed to newsletter`);
          }
        } catch (newsletterError) {
          console.error('❌ Error adding newsletter subscriber from consultation form:', newsletterError);
        }
      })() : Promise.resolve()
    ]);

    const bookingId = booking._id?.toString() || '';

    const bookingData = {
      _id: bookingId,
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      company: sanitizedData.company,
      serviceType: sanitizedData.serviceType,
      preferredDate: preferredDateObj,
      preferredTime: sanitizedData.preferredTime,
      consultationType: sanitizedData.consultationType,
      description: sanitizedData.description,
      status: 'pending' as const,
      createdAt: new Date()
    };

    handleCalendarOperations(bookingId, bookingData, startTime, endTime);
    handleEmailOperations(bookingId, sanitizedData, validatedData, booking);

    const responseTime = Date.now() - requestStartTime;
    console.log(`[PERF] Consultation booking completed in ${responseTime}ms - booking ${bookingId}`);

    res.json({
      success: true,
      message: "Consultation booked successfully! We will contact you soon to confirm your appointment.",
      bookingId: bookingId,
      booking: {
        ...booking,
        serviceTypeName: getCachedServiceTypeName(booking.serviceType),
        consultationTypeName: getCachedConsultationTypeName(booking.consultationType),
      }
    });
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    console.error(`[PERF] Consultation booking failed after ${responseTime}ms:`, error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to book consultation"
    });
  }
});

consultationsRoutes.get('/', async (req, res) => {
  try {
    const bookings = await storage.getAllConsultationBookings();
    const bookingsWithNames = bookings.map(booking => {
      const plainBooking = booking.toObject ? booking.toObject() : booking;
      return {
        id: plainBooking._id.toString(),
        firstName: plainBooking.firstName,
        lastName: plainBooking.lastName,
        email: plainBooking.email,
        phone: plainBooking.phone,
        company: plainBooking.company,
        serviceType: plainBooking.serviceType,
        preferredDate: plainBooking.preferredDate?.toISOString(),
        preferredTime: plainBooking.preferredTime,
        consultationType: plainBooking.consultationType,
        description: plainBooking.description,
        status: plainBooking.status,
        createdAt: plainBooking.createdAt?.toISOString(),
        serviceTypeName: getCachedServiceTypeName(plainBooking.serviceType),
        consultationTypeName: getCachedConsultationTypeName(plainBooking.consultationType),
      };
    });

    console.log(`[DEBUG] Returning ${bookingsWithNames.length} consultation bookings`);
    console.log(`[DEBUG] Sample booking keys:`, Object.keys(bookingsWithNames[0] || {}));

    res.setHeader('Content-Type', 'application/json');

    const cleanJson = JSON.stringify({ bookings: bookingsWithNames }, (key, value) => {
      if (key.startsWith('$') || key.startsWith('_') && key !== '_id') {
        return undefined;
      }
      return value;
    });

    res.send(cleanJson);
  } catch (error) {
    console.error("Get consultations error:", error);
    res.status(500).json({ error: "Failed to get consultation bookings" });
  }
});

consultationsRoutes.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await storage.getConsultationBooking(id);
    if (!booking) {
      return res.status(404).json({ error: "Consultation booking not found" });
    }

    const plainBooking = JSON.parse(JSON.stringify(booking));

    res.json({
      booking: {
        id: plainBooking._id,
        firstName: plainBooking.firstName,
        lastName: plainBooking.lastName,
        email: plainBooking.email,
        phone: plainBooking.phone,
        company: plainBooking.company,
        serviceType: plainBooking.serviceType,
        preferredDate: plainBooking.preferredDate,
        preferredTime: plainBooking.preferredTime,
        consultationType: plainBooking.consultationType,
        description: plainBooking.description,
        status: plainBooking.status,
        createdAt: plainBooking.createdAt,
        serviceTypeName: getCachedServiceTypeName(plainBooking.serviceType),
        consultationTypeName: getCachedConsultationTypeName(plainBooking.consultationType),
      }
    });
  } catch (error) {
    console.error("Get consultation error:", error);
    res.status(500).json({ error: "Failed to get consultation booking" });
  }
});

consultationsRoutes.patch('/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    console.log(`[DEBUG] Attempting to update consultation ${id} status to: ${status}`);

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      console.log(`[DEBUG] Invalid status provided: ${status}`);
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await storage.updateConsultationBookingStatus(id, status);
    if (!booking) {
      console.log(`[DEBUG] Consultation booking not found: ${id}`);
      return res.status(404).json({ error: "Consultation booking not found" });
    }

    const plainBooking = JSON.parse(JSON.stringify(booking));

    console.log(`[DEBUG] Successfully updated consultation ${id} status to: ${plainBooking.status}`);

    if (status === "confirmed") {
      try {
        await sendConsultationConfirmationEmail(plainBooking);
        console.log(`✅ Confirmation email sent to ${plainBooking.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send confirmation email to ${plainBooking.email}:`, emailError);
      }
    }

    if (plainBooking.calendarEventId) {
      try {
        if (status === "cancelled") {
          await microsoftCalendar.deleteEvent(plainBooking.calendarEventId);
          console.log(`✅ Calendar event deleted: ${plainBooking.calendarEventId}`);
        } else {
          await microsoftCalendar.updateEvent(plainBooking.calendarEventId, {
            ...plainBooking,
            status: status as "pending" | "confirmed" | "cancelled" | "completed"
          });
          console.log(`✅ Calendar event updated: ${plainBooking.calendarEventId}`);
        }
      } catch (calendarError) {
        console.error(`❌ Failed to update calendar event ${plainBooking.calendarEventId}:`, calendarError);
      }
    }

    res.json({
      success: true,
      message: `Consultation booking status updated to ${status}`,
      booking: {
        id: plainBooking._id,
        firstName: plainBooking.firstName,
        lastName: plainBooking.lastName,
        email: plainBooking.email,
        phone: plainBooking.phone,
        company: plainBooking.company,
        serviceType: plainBooking.serviceType,
        preferredDate: plainBooking.preferredDate,
        preferredTime: plainBooking.preferredTime,
        consultationType: plainBooking.consultationType,
        description: plainBooking.description,
        status: plainBooking.status,
        createdAt: plainBooking.createdAt,
        serviceTypeName: getCachedServiceTypeName(plainBooking.serviceType),
        consultationTypeName: getCachedConsultationTypeName(plainBooking.consultationType),
      }
    });
  } catch (error) {
    console.error("Update consultation status error:", error);
    res.status(500).json({ error: "Failed to update consultation booking status" });
  }
});
