import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { authRoutes } from "./routes/auth.routes";
import { clientAuthRoutes } from "./routes/clientAuth.routes";
import { clientRoutes } from "./routes/client.routes";
import { adminRoutes } from "./routes/admin.routes";
import { blogRoutes } from "./routes/blog.routes";
import { consultationsRoutes } from "./routes/consultations.routes";
import { contentRoutes } from "./routes/content.routes";
import { filesRoutes } from "./routes/files.routes";
import { chatRoutes } from "./routes/chat.routes";
import { apiRateLimit } from "./middleware/rateLimit";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/api', apiRateLimit);

  app.use('/api/auth', authRoutes);
  app.use('/api/client/auth', clientAuthRoutes);
  app.use('/api/client', clientRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/consultations', consultationsRoutes);
  app.use('/api', contentRoutes);
  app.use('/api', filesRoutes);
  app.use('/api/chat', chatRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
