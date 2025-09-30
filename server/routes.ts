import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, chatRequestSchema, consultationBookingSchema, insertUserSchema, insertBlogPostSchema, blogPostSchema } from "@shared/schema";
import { getChatbotResponse } from "./services/openai";
import { sendContactNotification, sendAutoReply, sendContactConfirmation, sendContactResponse, sendConsultationConfirmationEmail, sendNewsletter } from "./services/email";
import { sendConsultationBookingNotification, sendConsultationConfirmation, getServiceTypeName, getConsultationTypeName } from "./services/consultation";
import { authService } from "./services/auth";
import { EmailVerificationService } from "./services/email-verification";
import { nanoid } from "nanoid";
import sanitizeHtml from 'sanitize-html';
import { upload, saveFileMetadata } from "./upload";
import { textExtractionService } from "./services/text-extraction";
import { microsoftCalendar } from "./services/microsoft-calendar";
import path from 'path';
import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    console.log(`[AUTH DEBUG] ${req.method} ${req.path} - Authenticating request`);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log(`[AUTH DEBUG] Token present: ${!!token}`);

    if (!token) {
      console.log(`[AUTH DEBUG] No token provided for ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const user = await authService.getUserFromToken(token);
      console.log(`[AUTH DEBUG] User lookup result: ${user ? `User ${user.username} (${user.role})` : 'null'}`);

      if (!user) {
        console.log(`[AUTH DEBUG] Token verification failed for ${req.method} ${req.path}`);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = user;
      console.log(`[AUTH DEBUG] Authentication successful for user ${user.username} (${user.role})`);
      next();
    } catch (error) {
      console.error(`[AUTH DEBUG] Authentication error for ${req.method} ${req.path}:`, error);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const result = await authService.register(validatedData);
      if (!result) {
        return res.status(400).json({ error: 'User already exists or registration failed' });
      }

      res.json({
        success: true,
        message: 'User registered successfully',
        user: { id: result.user._id.toString(), username: result.user.username, role: result.user.role },
        token: result.token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const result = await authService.login(username, password);
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: { id: result.user._id.toString(), username: result.user.username, role: result.user.role },
        token: result.token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Verify token
  app.get("/api/auth/verify", authenticateToken, async (req: any, res) => {
    console.log(`[AUTH DEBUG] Token verification successful for user ${req.user.username} (${req.user.role})`);
    res.json({
      success: true,
      user: { id: req.user._id.toString(), username: req.user.username, role: req.user.role }
    });
  });

  // Send email verification code
  app.post("/api/auth/send-verification-code", async (req, res) => {
    try {
      const { email, firstName } = req.body;

      if (!email || !firstName) {
        return res.status(400).json({
          success: false,
          message: "Email and first name are required"
        });
      }

      const result = await EmailVerificationService.sendVerificationCode(email, firstName);

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error("Send verification code error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification code"
      });
    }
  });

  // Verify email verification code
  app.post("/api/auth/verify-email-code", async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and verification code are required"
        });
      }

      const result = await EmailVerificationService.verifyEmailCode(email, code);

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error("Verify email code error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify email code"
      });
    }
  });

  // Resend verification code
  app.post("/api/auth/resend-verification-code", async (req, res) => {
    try {
      const { email, firstName } = req.body;

      if (!email || !firstName) {
        return res.status(400).json({
          success: false,
          message: "Email and first name are required"
        });
      }

      const result = await EmailVerificationService.resendVerificationCode(email, firstName);

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error("Resend verification code error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resend verification code"
      });
    }
  });

  // Check email verification status
  app.get("/api/auth/verification-status/:email", async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      const isVerified = await EmailVerificationService.isEmailVerified(email);

      res.json({
        success: true,
        isVerified
      });
    } catch (error) {
      console.error("Check verification status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check verification status"
      });
    }
  });

  // Client authentication middleware
  const authenticateClient = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const user = await authService.getUserFromToken(token);
    if (!user || user.role !== 'client') {
      return res.status(403).json({ error: 'Client access required' });
    }

    req.user = user;
    next();
  };

  // Client registration
  app.post("/api/client/auth/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName, phone, company, role } = req.body;

      if (!username || !password || !email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "Username, password, email, first name, and last name are required"
        });
      }

      const userRole = role && ['client', 'employee'].includes(role) ? role : 'client';

      const result = await authService.register({
        username,
        password,
        email,
        firstName,
        lastName,
        phone,
        company,
        role: userRole
      });

      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Registration failed - user may already exist'
        });
      }

      // Create initial client profile
      try {
        await storage.createClientProfile({
          userId: new mongoose.Types.ObjectId(result.user._id),
          businessType: req.body.businessType,
          industry: req.body.industry,
          companySize: req.body.companySize,
          legalNeeds: req.body.legalNeeds,
          preferredContactMethod: req.body.preferredContactMethod || 'email',
          timezone: req.body.timezone || 'Africa/Harare'
        });
      } catch (profileError) {
        console.error('Error creating client profile:', profileError);
        // Don't fail registration if profile creation fails
      }

      // Send email verification code
      try {
        if (result.user.email) {
          await EmailVerificationService.sendVerificationCode(
            result.user.email,
            result.user.firstName || 'Client'
          );
          console.log(`✅ Verification code sent to ${result.user.email}`);
        } else {
          console.error('No email found for user, cannot send verification code');
        }
      } catch (verificationError) {
        console.error('Error sending verification code:', verificationError);
        // Don't fail registration if verification email fails
      }

      res.json({
        success: true,
        message: 'Client account created successfully. Please check your email for verification code.',
        user: {
          id: result.user._id.toString(),
          username: result.user.username,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role
        },
        token: result.token
      });
    } catch (error) {
      console.error("Client registration error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Client login
  app.post("/api/client/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const result = await authService.login(username, password);
      if (!result || (result.user.role !== 'client' && result.user.role !== 'employee')) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!result.user.isEmailVerified) {
        return res.status(403).json({
          error: 'Email not verified',
          message: 'Please verify your email address before logging in. Check your email for the verification code.',
          requiresVerification: true,
          email: result.user.email
        });
      }

      // Update last login
      await storage.updateUserRole(result.user._id.toString(), result.user.role);

      res.json({
        success: true,
        message: 'Client login successful',
        user: {
          id: result.user._id.toString(),
          username: result.user.username,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role
        },
        token: result.token
      });
    } catch (error) {
      console.error("Client login error:", error);
      res.status(500).json({ error: 'Client login failed' });
    }
  });

  // Client profile management
  app.get("/api/client/profile", authenticateClient, async (req: any, res) => {
    try {
      const profile = await storage.getClientProfile(req.user._id.toString());
      const user = await storage.getUser(req.user._id.toString());

      res.json({
        success: true,
        profile: profile || null,
        user: user ? {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          company: user.company,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        } : null
      });
    } catch (error) {
      console.error("Get client profile error:", error);
      res.status(500).json({ error: "Failed to get client profile" });
    }
  });

  app.put("/api/client/profile", authenticateClient, async (req: any, res) => {
    try {
      const { profileData, userData } = req.body;

      // Update user data if provided
      if (userData) {
        // Note: In a real app, you'd want to validate and sanitize this data
        await storage.updateUserRole(req.user._id.toString(), req.user.role); // This is just to update the user, we'd need a proper updateUser method
      }

      // Update or create client profile
      const profile = await storage.updateClientProfile(req.user._id.toString(), profileData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile
      });
    } catch (error) {
      console.error("Update client profile error:", error);
      res.status(500).json({ error: "Failed to update client profile" });
    }
  });

  // Client Dashboard API endpoints
  app.get("/api/client/dashboard", authenticateClient, async (req: any, res) => {
    try {
      const clientId = req.user._id.toString();

      // Get dashboard data in parallel
      const [consultations, messages, invoices, unreadCount] = await Promise.all([
        storage.getConsultationsForClient(clientId),
        storage.getMessagesForUser(clientId),
        storage.getInvoicesForClient(clientId),
        storage.getUnreadMessageCount(clientId)
      ]);

      // Get recent activity (last 5 items from each)
      const recentConsultations = consultations.slice(0, 3);
      const recentMessages = messages.slice(0, 3);
      const recentInvoices = invoices.slice(0, 3);

      res.json({
        success: true,
        dashboard: {
          stats: {
            totalConsultations: consultations.length,
            totalMessages: messages.length,
            totalInvoices: invoices.length,
            unreadMessages: unreadCount
          },
          recentActivity: {
            consultations: recentConsultations,
            messages: recentMessages,
            invoices: recentInvoices
          }
        }
      });
    } catch (error) {
      console.error("Get client dashboard error:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  // Client consultations
  app.get("/api/client/consultations", authenticateClient, async (req: any, res) => {
    try {
      const consultations = await storage.getConsultationsForClient(req.user._id.toString());
      res.json({ consultations });
    } catch (error) {
      console.error("Get client consultations error:", error);
      res.status(500).json({ error: "Failed to get consultations" });
    }
  });

  // Client messages/communications
  app.get("/api/client/messages", authenticateClient, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesForUser(req.user._id.toString());
      const unreadCount = await storage.getUnreadMessageCount(req.user._id.toString());
      res.json({ messages, unreadCount });
    } catch (error) {
      console.error("Get client messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/client/messages", authenticateClient, async (req: any, res) => {
    try {
      const { subject, content, messageType } = req.body;

      if (!subject || !content) {
        return res.status(400).json({ error: "Subject and content are required" });
      }

      // For now, messages to admin - in future could support client-to-client
      const adminUsers = await storage.getAllUsers();
      const adminUser = adminUsers.find(user => user.role === 'admin');

      if (!adminUser) {
        return res.status(500).json({ error: "No admin user found" });
      }

      const message = await storage.createMessage({
        fromUserId: new mongoose.Types.ObjectId(req.user._id),
        toUserId: new mongoose.Types.ObjectId(adminUser._id),
        subject: sanitizeHtml(subject, { allowedTags: [], allowedAttributes: {} }),
        content: sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }),
        messageType: messageType || 'general'
      });

      res.json({
        success: true,
        message: 'Message sent successfully',
        messageId: message._id
      });
    } catch (error) {
      console.error("Send client message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/client/messages/:id/read", authenticateClient, async (req: any, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
      console.error("Mark message read error:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Client invoices
  app.get("/api/client/invoices", authenticateClient, async (req: any, res) => {
    try {
      const invoices = await storage.getInvoicesForClient(req.user._id.toString());
      res.json({ invoices });
    } catch (error) {
      console.error("Get client invoices error:", error);
      res.status(500).json({ error: "Failed to get invoices" });
    }
  });

  // Client documents/files
  app.get("/api/client/documents", authenticateClient, async (req: any, res) => {
    try {
      const documents = await storage.getClientDocuments(req.user._id.toString());
      res.json({ documents });
    } catch (error) {
      console.error("Get client documents error:", error);
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  // Client resources
  app.get("/api/client/resources", authenticateClient, async (req: any, res) => {
    try {
      const { search, category } = req.query;
      let resources;

      if (search || category) {
        resources = await storage.searchResources(search as string, category as string);
      } else {
        resources = await storage.getResourcesForClients();
      }

      res.json({ resources });
    } catch (error) {
      console.error("Get client resources error:", error);
      res.status(500).json({ error: "Failed to get resources" });
    }
  });

  app.post("/api/client/resources/:id/download", authenticateClient, async (req: any, res) => {
    try {
      const resource = await storage.incrementResourceDownloadCount(req.params.id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      res.json({ success: true, message: 'Download recorded' });
    } catch (error) {
      console.error("Record resource download error:", error);
      res.status(500).json({ error: "Failed to record download" });
    }
  });

  // Admin User Management Routes
  // Get all users (admin only)
  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const users = await storage.getAllUsers();
      const usersWithIds = users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }));

      res.json({ users: usersWithIds });
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:id/role", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { role } = req.body;

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user._id.toString()) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Get all contact submissions (admin only)
  app.get("/api/admin/contacts", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const contacts = await storage.getAllContactSubmissions();
      console.log(`[DEBUG] Retrieved ${contacts.length} contact submissions from database`);
      const contactsWithIds = contacts.map(contact => ({
        id: contact._id.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        service: contact.service,
        message: contact.message,
        newsletter: contact.newsletter,
        status: contact.status,
        respondedAt: contact.respondedAt,
        createdAt: contact.createdAt
      }));

      console.log(`[DEBUG] Contact submissions response includes fields:`, Object.keys(contactsWithIds[0] || {}));
      res.json({ contacts: contactsWithIds });
    } catch (error) {
      console.error("Get admin contacts error:", error);
      res.status(500).json({ error: "Failed to get contacts" });
    }
  });

  // Get dashboard statistics (admin only)
  app.get("/api/admin/dashboard-stats", authenticateToken, async (req: any, res) => {
    try {
      console.log(`[ADMIN DEBUG] Dashboard stats request for user ${req.user.username} with role ${req.user.role}`);
      if (req.user.role !== 'admin') {
        console.log(`[ADMIN DEBUG] Access denied: User ${req.user.username} has role ${req.user.role}, admin required`);
        return res.status(403).json({ error: 'Admin access required' });
      }
      console.log(`[ADMIN DEBUG] Admin access granted for dashboard stats`);

      const [users, consultations, contacts, blogs] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllConsultationBookings(),
        storage.getAllContactSubmissions(),
        storage.getAllBlogPosts()
      ]);

      const publishedBlogs = blogs.filter(blog => blog.published);

      res.json({
        stats: {
          totalUsers: users.length,
          totalConsultations: consultations.length,
          totalContacts: contacts.length,
          totalBlogs: publishedBlogs.length
        }
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Failed to get dashboard statistics" });
    }
  });

  // Get recent activity (admin only)
  app.get("/api/admin/recent-activity", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const [consultations, contacts, blogs] = await Promise.all([
        storage.getAllConsultationBookings(),
        storage.getAllContactSubmissions(),
        storage.getAllBlogPosts()
      ]);

      // Get recent items from each collection
      const recentConsultations = consultations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(item => ({
          id: item._id.toString(),
          type: 'consultation',
          title: 'New consultation booking',
          description: `${item.firstName} ${item.lastName} booked a consultation`,
          timestamp: item.createdAt,
          color: 'green'
        }));

      const recentContacts = contacts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(item => ({
          id: item._id.toString(),
          type: 'contact',
          title: 'Contact form submitted',
          description: `${item.firstName} ${item.lastName} submitted a contact form`,
          timestamp: item.createdAt,
          color: 'yellow'
        }));

      const recentBlogs = blogs
        .filter(blog => blog.published)
        .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
        .slice(0, 5)
        .map(item => ({
          id: item._id.toString(),
          type: 'blog',
          title: 'Blog post published',
          description: `"${item.title}" was published`,
          timestamp: item.publishedAt || item.createdAt,
          color: 'blue'
        }));

      // Combine and sort all recent activities
      const allActivities = [...recentConsultations, ...recentContacts, ...recentBlogs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Return top 10 most recent

      res.json({ activities: allActivities });
    } catch (error) {
      console.error("Get recent activity error:", error);
      res.status(500).json({ error: "Failed to get recent activity" });
    }
  });

  // Blog routes
  // Get all published blog posts (public)
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getPublishedBlogPosts();
      res.json({ blogs });
    } catch (error) {
      console.error("Get blogs error:", error);
      res.status(500).json({ error: "Failed to get blogs" });
    }
  });

  // Get blog post by slug (public)
  app.get("/api/blogs/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const blog = await storage.getBlogPostBySlug(slug);
      if (!blog || !blog.published) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Parse content JSON back to object
      const blogWithParsedContent = {
        ...blog,
        content: JSON.parse(blog.content)
      };

      res.json({ blog: blogWithParsedContent });
    } catch (error) {
      console.error("Get blog error:", error);
      res.status(500).json({ error: "Failed to get blog post" });
    }
  });

  // Create blog post (admin only)
  app.post("/api/blogs", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { title, slug, excerpt, content, published } = req.body;

      // Validate required fields
      if (!title || !slug || !content) {
        return res.status(400).json({
          success: false,
          message: "Title, slug, and content are required"
        });
      }

      // Convert content array to JSON string for storage
      const contentJson = JSON.stringify(content);

      const blogPost = await storage.createBlogPost({
        title,
        slug,
        excerpt: excerpt || null,
        content: contentJson,
        published: published || false,
        authorId: req.user._id,
      });

      res.json({
        success: true,
        message: 'Blog post created successfully',
        blog: {
          ...blogPost,
          content: JSON.parse(blogPost.content) // Parse back for response
        }
      });
    } catch (error) {
      console.error("Create blog error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create blog post"
      });
    }
  });

  // Update blog post (admin only)
  app.put("/api/blogs/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const { title, slug, excerpt, content, published } = req.body;

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (slug !== undefined) updates.slug = slug;
      if (excerpt !== undefined) updates.excerpt = excerpt;
      if (content !== undefined) updates.content = JSON.stringify(content);
      if (published !== undefined) updates.published = published;

      const blogPost = await storage.updateBlogPost(id, updates);
      if (!blogPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json({
        success: true,
        message: 'Blog post updated successfully',
        blog: {
          ...blogPost,
          content: JSON.parse(blogPost.content) // Parse back for response
        }
      });
    } catch (error) {
      console.error("Update blog error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update blog post"
      });
    }
  });

  // Delete blog post (admin only)
  app.delete("/api/blogs/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const deleted = await storage.deleteBlogPost(id);

      if (!deleted) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error("Delete blog error:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Get all blog posts (admin only - includes drafts)
  app.get("/api/admin/blogs", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const blogs = await storage.getAllBlogPosts();

      // Parse content JSON for all blogs and convert _id to id
      const blogsWithParsedContent = blogs.map(blog => {
        const convertedBlog = {
          id: blog._id.toString(),
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: JSON.parse(blog.content),
          published: blog.published,
          publishedAt: blog.publishedAt,
          createdAt: blog.createdAt,
          authorId: blog.authorId
        };
        console.log('Converted blog ID:', convertedBlog.id, 'Original _id:', blog._id);
        return convertedBlog;
      });

      console.log('Sending blogs response with', blogsWithParsedContent.length, 'blogs');
      res.json({ blogs: blogsWithParsedContent });
    } catch (error) {
      console.error("Get admin blogs error:", error);
      res.status(500).json({ error: "Failed to get blogs" });
    }
  });

  // Content Management Routes - Static Pages
  app.get("/api/admin/content/pages", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const pages = await storage.getAllStaticPages();
      const pagesWithIds = pages.map(page => ({
        id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt,
        published: page.published,
        publishedAt: page.publishedAt,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        authorId: page.authorId
      }));

      res.json({ pages: pagesWithIds });
    } catch (error) {
      console.error("Get admin pages error:", error);
      res.status(500).json({ error: "Failed to get pages" });
    }
  });

  app.post("/api/admin/content/pages", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { title, slug, content, excerpt, published } = req.body;

      if (!title || !slug || !content) {
        return res.status(400).json({
          success: false,
          message: "Title, slug, and content are required"
        });
      }

      const page = await storage.createStaticPage({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        published: published || false,
        authorId: req.user._id
      });

      res.json({
        success: true,
        message: 'Page created successfully',
        page: {
          id: page._id.toString(),
          title: page.title,
          slug: page.slug,
          content: page.content,
          excerpt: page.excerpt,
          published: page.published,
          publishedAt: page.publishedAt,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          authorId: page.authorId
        }
      });
    } catch (error) {
      console.error("Create page error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create page"
      });
    }
  });

  app.put("/api/admin/content/pages/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const { title, slug, content, excerpt, published } = req.body;

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (slug !== undefined) updates.slug = slug;
      if (content !== undefined) updates.content = content;
      if (excerpt !== undefined) updates.excerpt = excerpt;
      if (published !== undefined) updates.published = published;

      const page = await storage.updateStaticPage(id, updates);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      res.json({
        success: true,
        message: 'Page updated successfully',
        page: {
          id: page._id.toString(),
          title: page.title,
          slug: page.slug,
          content: page.content,
          excerpt: page.excerpt,
          published: page.published,
          publishedAt: page.publishedAt,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          authorId: page.authorId
        }
      });
    } catch (error) {
      console.error("Update page error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update page"
      });
    }
  });

  app.delete("/api/admin/content/pages/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const deleted = await storage.deleteStaticPage(id);

      if (!deleted) {
        return res.status(404).json({ error: "Page not found" });
      }

      res.json({
        success: true,
        message: 'Page deleted successfully'
      });
    } catch (error) {
      console.error("Delete page error:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Content Management Routes - Testimonials
  app.get("/api/admin/testimonials", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const testimonials = await storage.getAllTestimonials();
      const testimonialsWithIds = testimonials.map(testimonial => ({
        id: testimonial._id.toString(),
        name: testimonial.name,
        position: testimonial.position,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        imageUrl: testimonial.imageUrl,
        published: testimonial.published,
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt
      }));

      res.json({ testimonials: testimonialsWithIds });
    } catch (error) {
      console.error("Get testimonials error:", error);
      res.status(500).json({ error: "Failed to get testimonials" });
    }
  });

  app.post("/api/admin/testimonials", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, position, company, content, rating, imageUrl, published } = req.body;

      if (!name || !content) {
        return res.status(400).json({
          success: false,
          message: "Name and content are required"
        });
      }

      const testimonial = await storage.createTestimonial({
        name,
        position: position || null,
        company: company || null,
        content,
        rating: rating || null,
        imageUrl: imageUrl || null,
        published: published || false
      });

      res.json({
        success: true,
        message: 'Testimonial created successfully',
        testimonial: {
          id: testimonial._id.toString(),
          name: testimonial.name,
          position: testimonial.position,
          company: testimonial.company,
          content: testimonial.content,
          rating: testimonial.rating,
          imageUrl: testimonial.imageUrl,
          published: testimonial.published,
          createdAt: testimonial.createdAt,
          updatedAt: testimonial.updatedAt
        }
      });
    } catch (error) {
      console.error("Create testimonial error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create testimonial"
      });
    }
  });

  app.put("/api/admin/testimonials/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const updates = req.body;

      const testimonial = await storage.updateTestimonial(id, updates);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      res.json({
        success: true,
        message: 'Testimonial updated successfully',
        testimonial: {
          id: testimonial._id.toString(),
          name: testimonial.name,
          position: testimonial.position,
          company: testimonial.company,
          content: testimonial.content,
          rating: testimonial.rating,
          imageUrl: testimonial.imageUrl,
          published: testimonial.published,
          createdAt: testimonial.createdAt,
          updatedAt: testimonial.updatedAt
        }
      });
    } catch (error) {
      console.error("Update testimonial error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update testimonial"
      });
    }
  });

  app.delete("/api/admin/testimonials/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const deleted = await storage.deleteTestimonial(id);

      if (!deleted) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      res.json({
        success: true,
        message: 'Testimonial deleted successfully'
      });
    } catch (error) {
      console.error("Delete testimonial error:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  // Content Management Routes - Team Members
  app.get("/api/admin/team", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const members = await storage.getAllTeamMembers();
      const membersWithIds = members.map(member => ({
        id: member._id.toString(),
        name: member.name,
        position: member.position,
        bio: member.bio,
        imageUrl: member.imageUrl,
        email: member.email,
        linkedinUrl: member.linkedinUrl,
        twitterUrl: member.twitterUrl,
        facebookUrl: member.facebookUrl,
        instagramUrl: member.instagramUrl,
        websiteUrl: member.websiteUrl,
        published: member.published,
        order: member.order,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }));

      res.json({ members: membersWithIds });
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ error: "Failed to get team members" });
    }
  });

  app.post("/api/admin/team", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, position, bio, imageUrl, email, linkedinUrl, twitterUrl, facebookUrl, instagramUrl, websiteUrl, published, order } = req.body;

      if (!name || !position) {
        return res.status(400).json({
          success: false,
          message: "Name and position are required"
        });
      }

      const member = await storage.createTeamMember({
        name,
        position,
        bio: bio || null,
        imageUrl: imageUrl || null,
        email: email || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        websiteUrl: websiteUrl || null,
        published: published || false,
        order: order || 0
      });

      res.json({
        success: true,
        message: 'Team member created successfully',
        member: {
          id: member._id.toString(),
          name: member.name,
          position: member.position,
          bio: member.bio,
          imageUrl: member.imageUrl,
          email: member.email,
          linkedinUrl: member.linkedinUrl,
          twitterUrl: member.twitterUrl,
          facebookUrl: member.facebookUrl,
          instagramUrl: member.instagramUrl,
          websiteUrl: member.websiteUrl,
          published: member.published,
          order: member.order,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt
        }
      });
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create team member"
      });
    }
  });

  app.put("/api/admin/team/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const updates = req.body;

      const member = await storage.updateTeamMember(id, updates);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }

      res.json({
        success: true,
        message: 'Team member updated successfully',
        member: {
          id: member._id.toString(),
          name: member.name,
          position: member.position,
          bio: member.bio,
          imageUrl: member.imageUrl,
          email: member.email,
          linkedinUrl: member.linkedinUrl,
          twitterUrl: member.twitterUrl,
          facebookUrl: member.facebookUrl,
          instagramUrl: member.instagramUrl,
          websiteUrl: member.websiteUrl,
          published: member.published,
          order: member.order,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt
        }
      });
    } catch (error) {
      console.error("Update team member error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update team member"
      });
    }
  });

  app.delete("/api/admin/team/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const deleted = await storage.deleteTeamMember(id);

      if (!deleted) {
        return res.status(404).json({ error: "Team member not found" });
      }

      res.json({
        success: true,
        message: 'Team member deleted successfully'
      });
    } catch (error) {
      console.error("Delete team member error:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  // Content Management Routes - FAQ Items
  app.get("/api/admin/faq", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const items = await storage.getAllFAQItems();
      const itemsWithIds = items.map(item => ({
        id: item._id.toString(),
        question: item.question,
        answer: item.answer,
        category: item.category,
        published: item.published,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      res.json({ faq: itemsWithIds });
    } catch (error) {
      console.error("Get FAQ items error:", error);
      res.status(500).json({ error: "Failed to get FAQ items" });
    }
  });

  app.post("/api/admin/faq", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { question, answer, category, published, order } = req.body;

      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          message: "Question and answer are required"
        });
      }

      const item = await storage.createFAQItem({
        question,
        answer,
        category: category || null,
        published: published || false,
        order: order || 0
      });

      res.json({
        success: true,
        message: 'FAQ item created successfully',
        item: {
          id: item._id.toString(),
          question: item.question,
          answer: item.answer,
          category: item.category,
          published: item.published,
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      });
    } catch (error) {
      console.error("Create FAQ item error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create FAQ item"
      });
    }
  });

  app.put("/api/admin/faq/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const updates = req.body;

      const item = await storage.updateFAQItem(id, updates);
      if (!item) {
        return res.status(404).json({ error: "FAQ item not found" });
      }

      res.json({
        success: true,
        message: 'FAQ item updated successfully',
        item: {
          id: item._id.toString(),
          question: item.question,
          answer: item.answer,
          category: item.category,
          published: item.published,
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      });
    } catch (error) {
      console.error("Update FAQ item error:", error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update FAQ item"
      });
    }
  });

  app.delete("/api/admin/faq/:id", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const deleted = await storage.deleteFAQItem(id);

      if (!deleted) {
        return res.status(404).json({ error: "FAQ item not found" });
      }

      res.json({
        success: true,
        message: 'FAQ item deleted successfully'
      });
    } catch (error) {
      console.error("Delete FAQ item error:", error);
      res.status(500).json({ error: "Failed to delete FAQ item" });
    }
  });

  // Public API Routes for Frontend Components
  // Get published testimonials (public)
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getPublishedTestimonials();
      const testimonialsWithIds = testimonials.map(testimonial => ({
        id: testimonial._id.toString(),
        name: testimonial.name,
        position: testimonial.position,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        imageUrl: testimonial.imageUrl,
        published: testimonial.published,
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt
      }));

      res.json({ testimonials: testimonialsWithIds });
    } catch (error) {
      console.error("Get public testimonials error:", error);
      res.status(500).json({ error: "Failed to get testimonials" });
    }
  });

  // Get published team members (public)
  app.get("/api/team", async (req, res) => {
    try {
      const members = await storage.getPublishedTeamMembers();
      const membersWithIds = members.map(member => ({
        id: member._id.toString(),
        name: member.name,
        position: member.position,
        bio: member.bio,
        imageUrl: member.imageUrl,
        email: member.email,
        linkedinUrl: member.linkedinUrl,
        twitterUrl: member.twitterUrl,
        facebookUrl: member.facebookUrl,
        instagramUrl: member.instagramUrl,
        websiteUrl: member.websiteUrl,
        published: member.published,
        order: member.order,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }));

      res.json({ members: membersWithIds });
    } catch (error) {
      console.error("Get public team members error:", error);
      res.status(500).json({ error: "Failed to get team members" });
    }
  });

  // Get published FAQ items (public)
  app.get("/api/faq", async (req, res) => {
    try {
      const items = await storage.getPublishedFAQItems();
      const itemsWithIds = items.map(item => ({
        id: item._id.toString(),
        question: item.question,
        answer: item.answer,
        category: item.category,
        published: item.published,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      res.json({ faq: itemsWithIds });
    } catch (error) {
      console.error("Get public FAQ items error:", error);
      res.status(500).json({ error: "Failed to get FAQ items" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);

      // Sanitize user input
      const sanitizedData = {
        firstName: sanitizeHtml(validatedData.firstName, { allowedTags: [], allowedAttributes: {} }),
        lastName: sanitizeHtml(validatedData.lastName, { allowedTags: [], allowedAttributes: {} }),
        email: sanitizeHtml(validatedData.email, { allowedTags: [], allowedAttributes: {} }),
        company: validatedData.company ? sanitizeHtml(validatedData.company, { allowedTags: [], allowedAttributes: {} }) : undefined,
        service: validatedData.service ? sanitizeHtml(validatedData.service, { allowedTags: [], allowedAttributes: {} }) : undefined,
        message: sanitizeHtml(validatedData.message, { allowedTags: [], allowedAttributes: {} }),
        newsletter: validatedData.newsletter
      };

      // Store the contact submission
      const contact = await storage.createContactSubmission(sanitizedData);

      // If newsletter subscription is requested, add to newsletter subscribers
      if (sanitizedData.newsletter) {
        try {
          // Check if subscriber already exists
          const existingSubscriber = await storage.getNewsletterSubscriber(sanitizedData.email);
          if (!existingSubscriber) {
            await storage.createNewsletterSubscriber({
              email: sanitizedData.email,
              firstName: sanitizedData.firstName,
              lastName: sanitizedData.lastName,
              source: 'contact-form'
            });
            console.log(`✅ Added ${sanitizedData.email} to newsletter subscribers`);
          } else {
            console.log(`ℹ️ ${sanitizedData.email} already subscribed to newsletter`);
          }
        } catch (newsletterError) {
          console.error('❌ Error adding newsletter subscriber:', newsletterError);
          // Don't fail the contact form submission if newsletter signup fails
        }
      }

      // Send notifications
      await sendContactNotification({
        ...sanitizedData,
        company: sanitizedData.company || undefined,
        service: sanitizedData.service || undefined,
        newsletter: sanitizedData.newsletter || false,
      });
      await sendAutoReply(validatedData.email, validatedData.firstName);

      res.json({
        success: true,
        message: "Thank you for your message! We will get back to you soon.",
        id: contact._id?.toString()
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
          
      // Sanitize user input
      const sanitizedMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });
      
      // Get AI response
      const aiResponse = await getChatbotResponse(sanitizedMessage);
      
      // Store the chat message
      await storage.createChatMessage(currentSessionId, sanitizedMessage, aiResponse.response);
      
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
      // Validate request body structure
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: "Invalid request body format"
        });
      }

      const validatedData = consultationBookingSchema.parse(req.body);

      // Sanitize user input with additional validation
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

      // Additional validation for required fields after sanitization
      if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.phone) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing or invalid after sanitization"
        });
      }
      
      // Transform validated data to match storage function expectations
      const preferredDateObj = new Date(validatedData.preferredDate);
      if (isNaN(preferredDateObj.getTime())) {
        throw new Error('Invalid preferred date format');
      }

      // Check calendar availability before booking
      const startTime = new Date(preferredDateObj);
      const timeSlot = sanitizedData.preferredTime;

      // Parse time slot to set hours and minutes
      if (timeSlot.includes('morning-9')) startTime.setHours(9, 0, 0, 0);
      else if (timeSlot.includes('morning-10')) startTime.setHours(10, 0, 0, 0);
      else if (timeSlot.includes('morning-11')) startTime.setHours(11, 0, 0, 0);
      else if (timeSlot.includes('afternoon-2')) startTime.setHours(14, 0, 0, 0);
      else if (timeSlot.includes('afternoon-3')) startTime.setHours(15, 0, 0, 0);
      else if (timeSlot.includes('afternoon-4')) startTime.setHours(16, 0, 0, 0);

      const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

      console.log(`🔍 Checking calendar availability for ${startTime.toISOString()} to ${endTime.toISOString()}`);

      // Check if the time slot is available
      const isAvailable = await microsoftCalendar.checkAvailability(startTime, endTime);

      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: "Selected time slot is not available. Please choose a different time."
        });
      }

      // Store the consultation booking
      const booking = await storage.createConsultationBooking({
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
      });

      // Create calendar event
      let calendarEventId: string | null = null;
      try {
        const bookingData = {
          _id: booking._id?.toString() || '',
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

        calendarEventId = await microsoftCalendar.createEvent(bookingData);

        if (calendarEventId) {
          // Update booking with calendar event ID
          await storage.updateConsultationBooking(booking._id?.toString() || '', {
            calendarEventId: calendarEventId
          });
          console.log(`✅ Calendar event created and linked: ${calendarEventId}`);
        }
      } catch (calendarError) {
        console.error('❌ Calendar integration error:', calendarError);
        // Don't fail the booking if calendar creation fails
        console.log('⚠️ Booking created successfully, but calendar event creation failed');
      }
      
      // Send notifications
      await sendConsultationBookingNotification({
        ...sanitizedData,
        company: sanitizedData.company || undefined,
      });
      await sendConsultationConfirmation(validatedData.email, validatedData.firstName, booking._id?.toString(), {
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
      });
      
      res.json({ 
        success: true, 
        message: "Consultation booked successfully! We will contact you soon to confirm your appointment.",
        bookingId: booking._id?.toString(),
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

  // Send personalized contact response
  app.post("/api/admin/contacts/:id/response", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const { responseMessage } = req.body;

      if (!responseMessage || !responseMessage.trim()) {
        return res.status(400).json({ error: 'Response message is required' });
      }

      // Get the contact submission
      const contact = await storage.getContactSubmission(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact submission not found" });
      }

      // Send personalized response email
      await sendContactResponse({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        service: contact.service,
        message: contact.message,
        newsletter: contact.newsletter,
        responseMessage: responseMessage.trim()
      });

      // Update contact status to responded
      const updatedContact = await storage.updateContactSubmissionStatus(id, 'responded');
      if (!updatedContact) {
        return res.status(404).json({ error: "Contact submission not found" });
      }

      console.log(`[DEBUG] Successfully sent personalized response and updated contact ${id} status to responded`);

      res.json({
        success: true,
        message: 'Personalized response sent successfully',
        contact: {
          id: updatedContact._id.toString(),
          firstName: updatedContact.firstName,
          lastName: updatedContact.lastName,
          email: updatedContact.email,
          company: updatedContact.company,
          service: updatedContact.service,
          message: updatedContact.message,
          newsletter: updatedContact.newsletter,
          status: updatedContact.status,
          respondedAt: updatedContact.respondedAt,
          createdAt: updatedContact.createdAt
        }
      });
    } catch (error) {
      console.error("Send personalized contact response error:", error);
      res.status(500).json({ error: "Failed to send personalized response" });
    }
  });

  // Update contact submission status
  app.patch("/api/admin/contacts/:id/status", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.params.id;
      const { status } = req.body;

      console.log(`[DEBUG] Attempting to update contact ${id} status to: ${status}`);

      if (!["pending", "responded"].includes(status)) {
        console.log(`[DEBUG] Invalid status provided: ${status}`);
        return res.status(400).json({ error: "Invalid status" });
      }

      const contact = await storage.updateContactSubmissionStatus(id, status);
      if (!contact) {
        console.log(`[DEBUG] Contact submission not found: ${id}`);
        return res.status(404).json({ error: "Contact submission not found" });
      }

      console.log(`[DEBUG] Successfully updated contact ${id} status to: ${contact.status}`);

      // Send confirmation email if status is changed to "responded"
      if (status === "responded") {
        try {
          await sendContactConfirmation({
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            company: contact.company,
            service: contact.service,
            message: contact.message,
            newsletter: contact.newsletter,
          });
          console.log(`✅ Confirmation email sent to ${contact.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send confirmation email to ${contact.email}:`, emailError);
          // Don't fail the status update if email fails
        }
      }

      res.json({
        success: true,
        message: `Contact submission status updated to ${status}`,
        contact: {
          id: contact._id.toString(),
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          company: contact.company,
          service: contact.service,
          message: contact.message,
          newsletter: contact.newsletter,
          status: contact.status,
          respondedAt: contact.respondedAt,
          createdAt: contact.createdAt
        }
      });
    } catch (error) {
      console.error("Update contact status error:", error);
      res.status(500).json({ error: "Failed to update contact submission status" });
    }
  });

  // Get all consultation bookings (for admin purposes)
  app.get("/api/consultations", async (req, res) => {
    try {
      const bookings = await storage.getAllConsultationBookings();
      const bookingsWithNames = bookings.map(booking => {
        // Use toObject() to get plain object and manually construct the response
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
          serviceTypeName: getServiceTypeName(plainBooking.serviceType),
          consultationTypeName: getConsultationTypeName(plainBooking.consultationType),
        };
      });

      console.log(`[DEBUG] Returning ${bookingsWithNames.length} consultation bookings`);
      console.log(`[DEBUG] Sample booking keys:`, Object.keys(bookingsWithNames[0] || {}));

      // Send response with explicit JSON content type and custom serializer
      res.setHeader('Content-Type', 'application/json');

      // Use JSON.stringify with replacer to ensure clean output
      const cleanJson = JSON.stringify({ bookings: bookingsWithNames }, (key, value) => {
        // Remove any Mongoose-specific properties
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

  // Get specific consultation booking
  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const booking = await storage.getConsultationBooking(id);
      if (!booking) {
        return res.status(404).json({ error: "Consultation booking not found" });
      }

      // Convert to plain object to avoid Mongoose metadata
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
          serviceTypeName: getServiceTypeName(plainBooking.serviceType),
          consultationTypeName: getConsultationTypeName(plainBooking.consultationType),
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

      // Convert to plain object to avoid Mongoose metadata
      const plainBooking = JSON.parse(JSON.stringify(booking));

      console.log(`[DEBUG] Successfully updated consultation ${id} status to: ${plainBooking.status}`);

      // Send confirmation email if status is changed to "confirmed"
      if (status === "confirmed") {
        try {
          await sendConsultationConfirmationEmail(plainBooking);
          console.log(`✅ Confirmation email sent to ${plainBooking.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send confirmation email to ${plainBooking.email}:`, emailError);
          // Don't fail the status update if email fails
        }
      }

      // Update calendar event if booking has calendar event ID
      if (plainBooking.calendarEventId) {
        try {
          if (status === "cancelled") {
            // Delete calendar event for cancelled bookings
            await microsoftCalendar.deleteEvent(plainBooking.calendarEventId);
            console.log(`✅ Calendar event deleted: ${plainBooking.calendarEventId}`);
          } else {
            // Update calendar event for other status changes
            await microsoftCalendar.updateEvent(plainBooking.calendarEventId, {
              ...plainBooking,
              status: status as "pending" | "confirmed" | "cancelled" | "completed"
            });
            console.log(`✅ Calendar event updated: ${plainBooking.calendarEventId}`);
          }
        } catch (calendarError) {
          console.error(`❌ Failed to update calendar event ${plainBooking.calendarEventId}:`, calendarError);
          // Don't fail the status update if calendar update fails
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
          serviceTypeName: getServiceTypeName(plainBooking.serviceType),
          consultationTypeName: getConsultationTypeName(plainBooking.consultationType),
        }
      });
    } catch (error) {
      console.error("Update consultation status error:", error);
      res.status(500).json({ error: "Failed to update consultation booking status" });
    }
  });

  // File upload routes
  // Upload single file
  app.post("/api/upload", authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileRecord = await saveFileMetadata(req.file, req.user._id.toString());

      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          id: fileRecord._id.toString(),
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          url: fileRecord.url,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload file"
      });
    }
  });

  // Upload multiple files
  app.post("/api/upload/multiple", authenticateToken, upload.array('files', 10), async (req: any, res) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedFiles = [];

      for (const file of files) {
        const fileRecord = await saveFileMetadata(file, req.user._id.toString());
        uploadedFiles.push({
          id: fileRecord._id.toString(),
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          url: fileRecord.url,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype
        });
      }

      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload files"
      });
    }
  });

  // Get user's files
  app.get("/api/files", authenticateToken, async (req: any, res) => {
    try {
      const files = await storage.getFilesByUser(req.user._id.toString());
      const filesWithIds = files.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        mimetype: file.mimetype,
        createdAt: file.createdAt
      }));

      res.json({ files: filesWithIds });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ error: "Failed to get files" });
    }
  });

  // Delete file
  app.delete("/api/files/:id", authenticateToken, async (req: any, res) => {
    try {
      const fileId = req.params.id;

      // First get the file to check ownership
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if user owns the file
      if (file.uploadedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const deleted = await storage.deleteFile(fileId);
      if (!deleted) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Serve uploaded files from MongoDB
  app.get('/api/files/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const file = await storage.getFile(id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set appropriate headers
      res.set({
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
        'Content-Disposition': `inline; filename="${file.originalName}"`,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      });

      // Use streaming for better performance with large files
      const buffer = file.data;
      const bufferStream = new PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(res);
    } catch (error) {
      console.error('File serving error:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  });

  // AI Training Data Routes
  // Upload training data file
  app.post("/api/admin/training/upload", authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileRecord = await saveFileMetadata(req.file, req.user._id.toString(), true);

      res.json({
        success: true,
        message: 'Training file uploaded successfully',
        file: {
          id: fileRecord._id.toString(),
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          url: fileRecord.url,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype,
          isTrainingData: fileRecord.isTrainingData,
          trainingEnabled: fileRecord.trainingEnabled,
          extractedText: fileRecord.extractedText ? 'Text extracted successfully' : 'Text extraction failed or not supported'
        }
      });
    } catch (error) {
      console.error('Training file upload error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload training file"
      });
    }
  });

  // Get all training files (admin only)
  app.get("/api/admin/training/files", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const trainingFiles = await storage.getTrainingFiles();
      const filesWithIds = trainingFiles.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        mimetype: file.mimetype,
        isTrainingData: file.isTrainingData,
        trainingEnabled: file.trainingEnabled,
        extractedText: file.extractedText,
        createdAt: file.createdAt
      }));

      res.json({ files: filesWithIds });
    } catch (error) {
      console.error('Get training files error:', error);
      res.status(500).json({ error: "Failed to get training files" });
    }
  });

  // Update training file status (enable/disable)
  app.patch("/api/admin/training/files/:id/status", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { trainingEnabled } = req.body;

      if (typeof trainingEnabled !== 'boolean') {
        return res.status(400).json({ error: 'trainingEnabled must be a boolean' });
      }

      const updatedFile = await storage.updateFileTrainingStatus(id, true, trainingEnabled);
      if (!updatedFile) {
        return res.status(404).json({ error: "Training file not found" });
      }

      res.json({
        success: true,
        message: `Training file ${trainingEnabled ? 'enabled' : 'disabled'} successfully`,
        file: {
          id: updatedFile._id.toString(),
          trainingEnabled: updatedFile.trainingEnabled
        }
      });
    } catch (error) {
      console.error('Update training file status error:', error);
      res.status(500).json({ error: "Failed to update training file status" });
    }
  });

  // Newsletter subscriber management routes (admin only)
  app.get("/api/admin/newsletter/subscribers", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const subscribers = await storage.getAllNewsletterSubscribers();
      const subscribersWithIds = subscribers.map(subscriber => ({
        id: subscriber._id.toString(),
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        source: subscriber.source,
        isActive: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt,
        unsubscribedAt: subscriber.unsubscribedAt,
        createdAt: subscriber.createdAt
      }));

      res.json({ subscribers: subscribersWithIds });
    } catch (error) {
      console.error("Get newsletter subscribers error:", error);
      res.status(500).json({ error: "Failed to get newsletter subscribers" });
    }
  });

  app.post("/api/admin/newsletter/subscribers", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { email, firstName, lastName } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if subscriber already exists
      const existingSubscriber = await storage.getNewsletterSubscriber(email);
      if (existingSubscriber) {
        return res.status(400).json({ error: 'Subscriber already exists' });
      }

      const subscriber = await storage.createNewsletterSubscriber({
        email: sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} }),
        firstName: firstName ? sanitizeHtml(firstName, { allowedTags: [], allowedAttributes: {} }) : undefined,
        lastName: lastName ? sanitizeHtml(lastName, { allowedTags: [], allowedAttributes: {} }) : undefined,
        source: 'admin-added'
      });

      res.json({
        success: true,
        message: 'Newsletter subscriber added successfully',
        subscriber: {
          id: subscriber._id.toString(),
          email: subscriber.email,
          firstName: subscriber.firstName,
          lastName: subscriber.lastName,
          source: subscriber.source,
          isActive: subscriber.isActive,
          subscribedAt: subscriber.subscribedAt
        }
      });
    } catch (error) {
      console.error("Add newsletter subscriber error:", error);
      res.status(500).json({ error: "Failed to add newsletter subscriber" });
    }
  });

  app.patch("/api/admin/newsletter/subscribers/:email/status", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { email } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean' });
      }

      const updates: any = { isActive };
      if (!isActive) {
        updates.unsubscribedAt = new Date();
      }

      const subscriber = await storage.updateNewsletterSubscriber(email, updates);
      if (!subscriber) {
        return res.status(404).json({ error: "Newsletter subscriber not found" });
      }

      res.json({
        success: true,
        message: `Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`,
        subscriber: {
          id: subscriber._id.toString(),
          email: subscriber.email,
          isActive: subscriber.isActive,
          unsubscribedAt: subscriber.unsubscribedAt
        }
      });
    } catch (error) {
      console.error("Update newsletter subscriber status error:", error);
      res.status(500).json({ error: "Failed to update newsletter subscriber status" });
    }
  });

  app.delete("/api/admin/newsletter/subscribers/:email", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { email } = req.params;
      const deleted = await storage.deleteNewsletterSubscriber(email);

      if (!deleted) {
        return res.status(404).json({ error: "Newsletter subscriber not found" });
      }

      res.json({
        success: true,
        message: 'Newsletter subscriber deleted successfully'
      });
    } catch (error) {
      console.error("Delete newsletter subscriber error:", error);
      res.status(500).json({ error: "Failed to delete newsletter subscriber" });
    }
  });

  // Send newsletter to all active subscribers
  app.post("/api/admin/newsletter/send", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { subject, content } = req.body;

      if (!subject || !content) {
        return res.status(400).json({ error: 'Subject and content are required' });
      }

      // Get all active subscribers
      const subscribers = await storage.getActiveNewsletterSubscribers();
      const subscriberEmails = subscribers.map(sub => sub.email);

      if (subscriberEmails.length === 0) {
        return res.status(400).json({ error: 'No active newsletter subscribers found' });
      }

      // Send newsletter
      const result = await sendNewsletter(
        sanitizeHtml(subject, { allowedTags: [], allowedAttributes: {} }),
        content, // Allow HTML content for rich formatting
        subscriberEmails
      );

      res.json({
        success: true,
        message: `Newsletter sent to ${result.success} subscribers${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        result
      });
    } catch (error) {
      console.error("Send newsletter error:", error);
      res.status(500).json({ error: "Failed to send newsletter" });
    }
  });

  // Mark existing file as training data
  app.patch("/api/admin/files/:id/mark-training", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;

      // First get the file to check ownership and extract text if needed
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if user owns the file
      if (file.uploadedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Extract text if not already extracted and file type is supported
      let extractedText = file.extractedText;
      if (!extractedText && textExtractionService.isSupportedType(file.mimetype)) {
        const extractionResult = await textExtractionService.extractText(
          file.data,
          file.mimetype,
          file.originalName
        );

        if (extractionResult.success && extractionResult.text) {
          extractedText = extractionResult.text;
        }
      }

      // Update file to mark as training data
      const updateData: any = {
        isTrainingData: true,
        trainingEnabled: true
      };

      if (extractedText && !file.extractedText) {
        updateData.extractedText = extractedText;
      }

      const updatedFile = await storage.updateFileTrainingStatus(id, true, true);
      if (!updatedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({
        success: true,
        message: 'File marked as training data successfully',
        file: {
          id: updatedFile._id.toString(),
          isTrainingData: updatedFile.isTrainingData,
          trainingEnabled: updatedFile.trainingEnabled,
          extractedText: updatedFile.extractedText ? 'Text extracted successfully' : 'Text extraction failed or not supported'
        }
      });
    } catch (error) {
      console.error('Mark file as training error:', error);
      res.status(500).json({ error: "Failed to mark file as training data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
