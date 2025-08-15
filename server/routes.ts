import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, chatRequestSchema, consultationBookingSchema } from "@shared/schema";
import { getChatbotResponse } from "./services/openai";
import { sendContactNotification, sendAutoReply } from "./services/email";
import { sendConsultationBookingNotification, sendConsultationConfirmation, getServiceTypeName, getConsultationTypeName } from "./services/consultation";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      
      // Store the contact submission
      const contact = await storage.createContactSubmission(validatedData);
      
      // Send notifications
      await sendContactNotification({
        ...validatedData,
        company: validatedData.company || undefined,
        service: validatedData.service || undefined,
        newsletter: validatedData.newsletter || false,
      });
      await sendAutoReply(validatedData.email, validatedData.firstName);
      
      res.json({ 
        success: true, 
        message: "Thank you for your message! We will get back to you soon.",
        id: contact.id 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to process contact form" 
      });
    }
  });

  // AI chatbot endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = chatRequestSchema.parse(req.body);
      const currentSessionId = sessionId || nanoid();
      
      // Get AI response
      const aiResponse = await getChatbotResponse(message);
      
      // Store the chat message
      await storage.createChatMessage(currentSessionId, message, aiResponse.response);
      
      res.json({
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        followUpSuggestions: aiResponse.followUpSuggestions,
        sessionId: currentSessionId,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const history = await storage.getChatHistory(sessionId);
      res.json({ history });
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Failed to get chat history" });
    }
  });

  // Book consultation
  app.post("/api/consultations", async (req, res) => {
    try {
      const validatedData = consultationBookingSchema.parse(req.body);
      
      // Transform validated data to match storage function expectations
      const storageData = {
        ...validatedData,
        preferredDate: new Date(validatedData.preferredDate),
      };
      
      // Store the consultation booking
      const booking = await storage.createConsultationBooking(storageData);
      
      // Send notifications
      await sendConsultationBookingNotification({
        ...validatedData,
        company: validatedData.company || undefined,
      });
      await sendConsultationConfirmation(validatedData.email, validatedData.firstName, booking.id);
      
      res.json({ 
        success: true, 
        message: "Consultation booked successfully! We will contact you soon to confirm your appointment.",
        bookingId: booking.id,
        booking: {
          ...booking,
          serviceTypeName: getServiceTypeName(booking.serviceType),
          consultationTypeName: getConsultationTypeName(booking.consultationType),
        }
      });
    } catch (error) {
      console.error("Consultation booking error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to book consultation" 
      });
    }
  });

  // Get all consultation bookings (for admin purposes)
  app.get("/api/consultations", async (req, res) => {
    try {
      const bookings = await storage.getAllConsultationBookings();
      const bookingsWithNames = bookings.map(booking => ({
        ...booking,
        serviceTypeName: getServiceTypeName(booking.serviceType),
        consultationTypeName: getConsultationTypeName(booking.consultationType),
      }));
      res.json({ bookings: bookingsWithNames });
    } catch (error) {
      console.error("Get consultations error:", error);
      res.status(500).json({ error: "Failed to get consultation bookings" });
    }
  });

  // Get specific consultation booking
  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getConsultationBooking(id);
      if (!booking) {
        return res.status(404).json({ error: "Consultation booking not found" });
      }
      res.json({ 
        booking: {
          ...booking,
          serviceTypeName: getServiceTypeName(booking.serviceType),
          consultationTypeName: getConsultationTypeName(booking.consultationType),
        }
      });
    } catch (error) {
      console.error("Get consultation error:", error);
      res.status(500).json({ error: "Failed to get consultation booking" });
    }
  });

  // Update consultation booking status
  app.patch("/api/consultations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const booking = await storage.updateConsultationBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ error: "Consultation booking not found" });
      }
      
      res.json({ 
        success: true, 
        message: `Consultation booking status updated to ${status}`,
        booking: {
          ...booking,
          serviceTypeName: getServiceTypeName(booking.serviceType),
          consultationTypeName: getConsultationTypeName(booking.consultationType),
        }
      });
    } catch (error) {
      console.error("Update consultation status error:", error);
      res.status(500).json({ error: "Failed to update consultation booking status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
