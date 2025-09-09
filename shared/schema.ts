import { z } from "zod";

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "user"]).default("user"),
});

export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  password: z.string(),
  role: z.enum(["admin", "user"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Contact submission schemas
export const insertContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  newsletter: z.boolean().default(false),
});

export const contactSubmissionSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string(),
  newsletter: z.boolean(),
  status: z.enum(["pending", "responded"]),
  respondedAt: z.date().optional(),
  createdAt: z.date(),
});

// Chat message schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

export const chatMessageSchema = z.object({
  _id: z.string(),
  sessionId: z.string(),
  userMessage: z.string(),
  aiResponse: z.string(),
  createdAt: z.date(),
});

// Consultation booking schemas
export const insertConsultationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().optional(),
  serviceType: z.string().min(1, "Service type is required"),
  preferredDate: z.date(),
  preferredTime: z.string().min(1, "Preferred time is required"),
  consultationType: z.string().min(1, "Consultation type is required"),
  description: z.string().min(1, "Description is required"),
});

export const consultationBookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().optional(),
  serviceType: z.enum(["regulatory", "ai", "strategy", "training", "documents", "support"], {
    required_error: "Please select a service type",
  }),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.enum([
    "morning-9", "morning-10", "morning-11",
    "afternoon-2", "afternoon-3", "afternoon-4"
  ], {
    required_error: "Please select a preferred time",
    invalid_type_error: "Please select a valid time slot",
  }),
  consultationType: z.enum(["in-person", "video-call", "phone-call"], {
    required_error: "Please select a consultation type",
  }),
  description: z.string().min(1, "Description is required"),
});

export const consultationBookingResponseSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  company: z.string().optional(),
  serviceType: z.string(),
  preferredDate: z.date(),
  preferredTime: z.string(),
  consultationType: z.string(),
  description: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  createdAt: z.date(),
});

// Blog post schemas
export const insertBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  authorId: z.string(),
  published: z.boolean().default(false),
});

export const blogPostSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  authorId: z.string(),
  published: z.boolean(),
  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const blogPostFormSchema = insertBlogPostSchema.extend({
  publishedAt: z.string().optional(),
});

// File schema
export const fileSchema = z.object({
  _id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  data: z.any(), // Buffer in MongoDB
  url: z.string(),
  uploadedBy: z.string(),
  isTrainingData: z.boolean().optional(),
  extractedText: z.string().optional(),
  trainingEnabled: z.boolean().optional(),
  createdAt: z.date(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type ConsultationBooking = z.infer<typeof consultationBookingResponseSchema>;
export type ConsultationBookingForm = z.infer<typeof consultationBookingSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type BlogPostForm = z.infer<typeof blogPostFormSchema>;
export type File = z.infer<typeof fileSchema>;
