import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, chatRequestSchema, consultationBookingSchema, insertUserSchema, insertBlogPostSchema, blogPostSchema } from "@shared/schema";
import { getChatbotResponse } from "./services/openai";
import { sendContactNotification, sendAutoReply, sendContactConfirmation, sendConsultationConfirmationEmail } from "./services/email";
import { sendConsultationBookingNotification, sendConsultationConfirmation, getServiceTypeName, getConsultationTypeName } from "./services/consultation";
import { authService } from "./services/auth";
import { nanoid } from "nanoid";
import sanitizeHtml from 'sanitize-html';
import { upload, saveFileMetadata } from "./upload";
import { textExtractionService } from "./services/text-extraction";
import { microsoftCalendar } from "./services/microsoft-calendar";
import path from 'path';
import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';

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
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

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
