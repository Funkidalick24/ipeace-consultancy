import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, chatRequestSchema, consultationBookingSchema, insertUserSchema, insertBlogPostSchema, blogPostSchema } from "@shared/schema";
import { getChatbotResponse } from "./services/openai";
import { sendContactNotification, sendAutoReply } from "./services/email";
import { sendConsultationBookingNotification, sendConsultationConfirmation, getServiceTypeName, getConsultationTypeName } from "./services/consultation";
import { authService } from "./services/auth";
import { nanoid } from "nanoid";
import sanitizeHtml from 'sanitize-html';
import { upload, saveFileMetadata } from "./upload";
import { textExtractionService } from "./services/text-extraction";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const user = await authService.getUserFromToken(token);
    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
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
    res.json({
      success: true,
      user: { id: req.user._id.toString(), username: req.user.username, role: req.user.role }
    });
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
      const validatedData = consultationBookingSchema.parse(req.body);
          
      // Sanitize user input
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
      
      // Transform validated data to match storage function expectations
      const storageData = {
        ...validatedData,
        preferredDate: new Date(validatedData.preferredDate),
      };
      
      // Store the consultation booking
      const booking = await storage.createConsultationBooking({
        ...storageData,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        company: sanitizedData.company,
        serviceType: sanitizedData.serviceType,
        preferredDate: new Date(sanitizedData.preferredDate),
        preferredTime: sanitizedData.preferredTime,
        consultationType: sanitizedData.consultationType,
        description: sanitizedData.description
      });
      
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
      const id = req.params.id;
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
      const id = req.params.id;
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
        'Content-Disposition': `inline; filename="${file.originalName}"`
      });

      // Send the binary data
      res.send(file.data);
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
