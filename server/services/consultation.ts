export interface ConsultationNotification {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  description: string;
}

import { emailTemplates } from './email-config';
import { loadAndRenderTemplate, formatEmailDate, formatEmailTime } from './template-engine';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the correct template directory path
const getTemplateDir = async () => {
  // In development, templates are in server/templates
  // In production/dist, they might be in a different location
  const devPath = path.join(__dirname, '../templates');
  const altPath = path.join(__dirname, '../../templates');
  const rootPath = path.join(process.cwd(), 'server/templates');

  // Check paths in order of preference
  const paths = [devPath, altPath, rootPath];

  for (const testPath of paths) {
    try {
      const fs = await import('fs/promises');
      await fs.access(testPath);
      console.log(`✅ Template directory found: ${testPath}`);
      return testPath;
    } catch {
      // Continue to next path
    }
  }

  console.log(`⚠️ Template directory not found, using fallback: ${devPath}`);
  return devPath; // fallback to dev path
};

import { emailConfig } from './email-config';
import nodemailer from 'nodemailer';

// Mock email transporter (for development/testing)
class MockEmailTransporter {
  async sendMail(options: any): Promise<void> {
    console.log('📧 EMAIL SENT (Mock):', {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html,
      timestamp: new Date().toISOString(),
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Real email transporter (for production)
class RealEmailTransporter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });
  }

  async sendMail(options: any): Promise<void> {
    await this.transporter.sendMail({
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}

// Switch between mock and real transporter based on environment
const transporter = process.env.NODE_ENV === 'production'
  ? new RealEmailTransporter()
  : new MockEmailTransporter();

export async function sendConsultationBookingNotification(booking: ConsultationNotification): Promise<void> {
  console.log('🚀 sendConsultationBookingNotification called with:', {
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    serviceType: booking.serviceType
  });
  try {
    // Validate required booking data
    if (!booking.firstName || !booking.lastName || !booking.email || !booking.phone) {
      throw new Error('Missing required booking information for notification');
    }

    const timestamp = new Date().toISOString();

    // Prepare data for templates with safe fallbacks
    const templateData = {
      firstName: booking.firstName || 'Unknown',
      lastName: booking.lastName || 'Unknown',
      email: booking.email || 'Not provided',
      phone: booking.phone || 'Not provided',
      company: booking.company || 'Not specified',
      serviceType: getServiceTypeName(booking.serviceType),
      consultationType: getConsultationTypeName(booking.consultationType),
      preferredDate: formatEmailDate(booking.preferredDate),
      preferredTime: formatEmailTime(booking.preferredTime),
      description: booking.description || 'No description provided',
      timestamp: formatEmailDate(new Date()),
    };

    // Send notification to company
    const templateDir = await getTemplateDir();
    const companyTemplatePath = path.join(templateDir, 'consultation-company.html');
    console.log(`🔍 Loading company template from: ${companyTemplatePath}`);
    console.log(`📁 Template directory resolved to: ${templateDir}`);
    const companyHtml = await loadAndRenderTemplate(companyTemplatePath, templateData);
    console.log(`✅ Company template loaded successfully, length: ${companyHtml.length} characters`);

    await transporter.sendMail({
      to: emailConfig.companyEmail,
      subject: emailTemplates.consultation.companySubject,
      html: companyHtml,
      text: `New consultation booking from ${booking.firstName} ${booking.lastName} for ${templateData.serviceType}`,
    });

    console.log('✅ Consultation company notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending consultation company notification:', error);
    // Don't throw error to prevent booking failure due to email issues
    console.log('⚠️ Continuing with booking despite email notification failure');
  }
}

export async function sendConsultationConfirmation(email: string, firstName: string, bookingId: string, booking?: any): Promise<void> {
  console.log('🚀 sendConsultationConfirmation called with:', {
    email,
    firstName,
    bookingId,
    hasBooking: !!booking
  });
  try {
    // Validate required parameters
    if (!email || !firstName || !bookingId) {
      console.log(`⚠️ Missing required parameters for confirmation email: email=${!!email}, firstName=${!!firstName}, bookingId=${!!bookingId}`);
      return;
    }

    if (!booking) {
      console.log(`⚠️ Booking data not provided for confirmation email to ${firstName} at ${email}`);
      return;
    }

    // Prepare data for customer template with safe fallbacks
    const templateData = {
      firstName: firstName || 'Valued Customer',
      lastName: booking.lastName || 'Unknown',
      email: email,
      phone: booking.phone || 'Not provided',
      company: booking.company || 'Not specified',
      serviceType: getServiceTypeName(booking.serviceType),
      consultationType: getConsultationTypeName(booking.consultationType),
      preferredDate: formatEmailDate(booking.preferredDate),
      preferredTime: formatEmailTime(booking.preferredTime),
      description: booking.description || 'No description provided',
      bookingId: bookingId,
      googleCalendarUrl: generateGoogleCalendarURL(booking),
      calendarInviteUrl: generateCalendarInviteURL(booking),
    };

    // Send confirmation to customer
    const customerTemplateDir = await getTemplateDir();
    const customerTemplatePath = path.join(customerTemplateDir, 'consultation-customer.html');
    console.log(`🔍 Loading customer template from: ${customerTemplatePath}`);
    console.log(`📁 Template directory resolved to: ${customerTemplateDir}`);
    const customerHtml = await loadAndRenderTemplate(customerTemplatePath, templateData);
    console.log(`✅ Customer template loaded successfully, length: ${customerHtml.length} characters`);

    await transporter.sendMail({
      to: email,
      subject: emailTemplates.consultation.customerSubject,
      html: customerHtml,
      text: `Your consultation booking #${bookingId} has been confirmed. We'll contact you soon to finalize details.`,
    });

    console.log('✅ Consultation customer confirmation sent successfully');
  } catch (error) {
    console.error('❌ Error sending consultation confirmation:', error);
    // Don't throw error to prevent booking failure due to email issues
    console.log('⚠️ Continuing with booking despite customer confirmation email failure');
  }
}

export function getServiceTypeName(serviceType: string): string {
  const serviceNames: Record<string, string> = {
    regulatory: "Regulatory Compliance",
    ai: "AI-Powered Advisory",
    strategy: "Business Strategy",
    training: "Training & Development",
    documents: "Document Services",
    support: "24/7 Support",
  };
  return serviceNames[serviceType] || serviceType;
}

export function getConsultationTypeName(consultationType: string): string {
  const consultationNames: Record<string, string> = {
    "in-person": "In-Person Meeting",
    "video-call": "Video Call",
    "phone-call": "Phone Call",
  };
  return consultationNames[consultationType] || consultationType;
}

/**
 * Generate calendar invite data for consultation bookings
 */
export interface CalendarInviteData {
  subject: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  organizer: string;
  attendee: string;
}

/**
 * Generate ICS calendar invite content
 */
export function generateCalendarInviteICS(booking: any): string {
  const startTime = new Date(booking.preferredDate);
  const timeSlot = booking.preferredTime;

  // Parse time slot to set hours and minutes
  if (timeSlot.includes('morning-9')) startTime.setHours(9, 0, 0, 0);
  else if (timeSlot.includes('morning-10')) startTime.setHours(10, 0, 0, 0);
  else if (timeSlot.includes('morning-11')) startTime.setHours(11, 0, 0, 0);
  else if (timeSlot.includes('afternoon-2')) startTime.setHours(14, 0, 0, 0);
  else if (timeSlot.includes('afternoon-3')) startTime.setHours(15, 0, 0, 0);
  else if (timeSlot.includes('afternoon-4')) startTime.setHours(16, 0, 0, 0);

  const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

  // Get location based on consultation type
  const locations: Record<string, string> = {
    'in-person': 'IPEACE Office - 135 Baines Avenue, Harare, Zimbabwe',
    'video-call': 'Microsoft Teams Meeting',
    'phone-call': 'Phone Consultation'
  };
  const location = locations[booking.consultationType] || 'To be confirmed';

  const subject = `Consultation: ${booking.firstName} ${booking.lastName}`;
  const description = `Consultation booking with IPEACE Consultancy

Client: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}
${booking.company ? `Company: ${booking.company}\n` : ''}Service: ${getServiceTypeName(booking.serviceType)}
Type: ${getConsultationTypeName(booking.consultationType)}

Description:
${booking.description}

Booking ID: ${booking._id || booking.bookingId}

Please contact us if you need to reschedule or make changes.`;

  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IPEACE Consultancy//Consultation Booking//EN
BEGIN:VEVENT
UID:${booking._id || booking.bookingId || Date.now()}@ipeace-consultancy.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${subject}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
ORGANIZER;CN=IPEACE Consultancy:mailto:info@ipeace-consultancy.com
ATTENDEE;CN=${booking.firstName} ${booking.lastName}:mailto:${booking.email}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Generate calendar invite download URL
 */
export function generateCalendarInviteURL(booking: any): string {
  const icsContent = generateCalendarInviteICS(booking);
  const encodedICS = encodeURIComponent(icsContent);
  return `data:text/calendar;charset=utf-8,${encodedICS}`;
}

/**
 * Generate Google Calendar add event URL
 */
export function generateGoogleCalendarURL(booking: any): string {
  const startTime = new Date(booking.preferredDate);
  const timeSlot = booking.preferredTime;

  // Parse time slot to set hours and minutes
  if (timeSlot.includes('morning-9')) startTime.setHours(9, 0, 0, 0);
  else if (timeSlot.includes('morning-10')) startTime.setHours(10, 0, 0, 0);
  else if (timeSlot.includes('morning-11')) startTime.setHours(11, 0, 0, 0);
  else if (timeSlot.includes('afternoon-2')) startTime.setHours(14, 0, 0, 0);
  else if (timeSlot.includes('afternoon-3')) startTime.setHours(15, 0, 0, 0);
  else if (timeSlot.includes('afternoon-4')) startTime.setHours(16, 0, 0, 0);

  const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

  const locations: Record<string, string> = {
    'in-person': 'IPEACE Office - 135 Baines Avenue, Harare, Zimbabwe',
    'video-call': 'Microsoft Teams Meeting',
    'phone-call': 'Phone Consultation'
  };
  const location = locations[booking.consultationType] || 'To be confirmed';

  const subject = `Consultation: ${booking.firstName} ${booking.lastName}`;
  const description = `Consultation booking with IPEACE Consultancy

Client: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}
${booking.company ? `Company: ${booking.company}\n` : ''}Service: ${getServiceTypeName(booking.serviceType)}
Type: ${getConsultationTypeName(booking.consultationType)}

Description:
${booking.description}

Booking ID: ${booking._id || booking.bookingId}

Please contact us if you need to reschedule or make changes.`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: subject,
    dates: `${startTime.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')}/${endTime.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')}`,
    details: description,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}