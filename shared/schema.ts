import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  service: text("service"),
  message: text("message").notNull(),
  newsletter: boolean("newsletter").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultationBookings = pgTable("consultation_bookings", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  serviceType: text("service_type").notNull(),
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  consultationType: text("consultation_type").notNull(), // 'in-person', 'video-call', 'phone-call'
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

export const insertConsultationSchema = createInsertSchema(consultationBookings).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const consultationBookingSchema = insertConsultationSchema.extend({
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  phone: z.string().min(1, "Phone number is required"),
  serviceType: z.enum(["regulatory", "ai", "strategy", "training", "documents", "support"], {
    required_error: "Please select a service type",
  }),
  consultationType: z.enum(["in-person", "video-call", "phone-call"], {
    required_error: "Please select a consultation type",
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type ConsultationBooking = typeof consultationBookings.$inferSelect;
export type ConsultationBookingForm = z.infer<typeof consultationBookingSchema>;
