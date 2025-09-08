import { User, ContactSubmission, ChatMessage, ConsultationBooking, BlogPost, File, IUser, IContactSubmission, IChatMessage, IConsultationBooking, IBlogPost, IFile } from "./models";
import { type InsertUser, type InsertContact, type InsertConsultation, type InsertBlogPost } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;
  createContactSubmission(contact: InsertContact): Promise<IContactSubmission>;
  createChatMessage(sessionId: string, userMessage: string, aiResponse: string): Promise<IChatMessage>;
  getChatHistory(sessionId: string): Promise<IChatMessage[]>;
  createConsultationBooking(booking: InsertConsultation): Promise<IConsultationBooking>;
  getAllConsultationBookings(): Promise<IConsultationBooking[]>;
  getConsultationBooking(id: string): Promise<IConsultationBooking | null>;
  updateConsultationBookingStatus(id: string, status: string): Promise<IConsultationBooking | null>;
  // Blog methods
  createBlogPost(blogPost: InsertBlogPost): Promise<IBlogPost>;
  getBlogPost(id: string): Promise<IBlogPost | null>;
  getBlogPostBySlug(slug: string): Promise<IBlogPost | null>;
  getAllBlogPosts(): Promise<IBlogPost[]>;
  getPublishedBlogPosts(): Promise<IBlogPost[]>;
  updateBlogPost(id: string, blogPost: Partial<InsertBlogPost>): Promise<IBlogPost | null>;
  deleteBlogPost(id: string): Promise<boolean>;
  // File methods
  createFile(file: Partial<IFile>): Promise<IFile>;
  getFile(id: string): Promise<IFile | null>;
  getFilesByUser(userId: string): Promise<IFile[]>;
  deleteFile(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    try {
      const user = new User({
        ...insertUser,
        role: insertUser.role || "user"
      });
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createContactSubmission(contact: InsertContact): Promise<IContactSubmission> {
    try {
      const submission = new ContactSubmission({
        ...contact,
        company: contact.company || undefined,
        service: contact.service || undefined,
        newsletter: contact.newsletter || false
      });
      return await submission.save();
    } catch (error) {
      console.error('Error creating contact submission:', error);
      throw error;
    }
  }

  async createChatMessage(sessionId: string, userMessage: string, aiResponse: string): Promise<IChatMessage> {
    try {
      const message = new ChatMessage({
        sessionId,
        userMessage,
        aiResponse
      });
      return await message.save();
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string): Promise<IChatMessage[]> {
    try {
      return await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async createConsultationBooking(booking: InsertConsultation): Promise<IConsultationBooking> {
    try {
      const consultation = new ConsultationBooking({
        ...booking,
        company: booking.company || undefined,
        status: "pending",
        preferredDate: new Date(booking.preferredDate)
      });
      return await consultation.save();
    } catch (error) {
      console.error('Error creating consultation booking:', error);
      throw error;
    }
  }

  async getAllConsultationBookings(): Promise<IConsultationBooking[]> {
    try {
      return await ConsultationBooking.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting consultation bookings:', error);
      return [];
    }
  }

  async getConsultationBooking(id: string): Promise<IConsultationBooking | null> {
    try {
      return await ConsultationBooking.findById(id);
    } catch (error) {
      console.error('Error getting consultation booking:', error);
      return null;
    }
  }

  async updateConsultationBookingStatus(id: string, status: string): Promise<IConsultationBooking | null> {
    try {
      return await ConsultationBooking.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating consultation booking status:', error);
      return null;
    }
  }

  // Blog methods
  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<IBlogPost> {
    try {
      const blogPost = new BlogPost({
        ...insertBlogPost,
        excerpt: insertBlogPost.excerpt || undefined,
        published: insertBlogPost.published || false,
        publishedAt: insertBlogPost.published ? new Date() : undefined
      });
      return await blogPost.save();
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  async getBlogPost(id: string): Promise<IBlogPost | null> {
    try {
      return await BlogPost.findById(id);
    } catch (error) {
      console.error('Error getting blog post:', error);
      return null;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<IBlogPost | null> {
    try {
      return await BlogPost.findOne({ slug });
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return null;
    }
  }

  async getAllBlogPosts(): Promise<IBlogPost[]> {
    try {
      return await BlogPost.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all blog posts:', error);
      return [];
    }
  }

  async getPublishedBlogPosts(): Promise<IBlogPost[]> {
    try {
      return await BlogPost.find({ published: true }).sort({ publishedAt: -1 });
    } catch (error) {
      console.error('Error getting published blog posts:', error);
      return [];
    }
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<IBlogPost | null> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };

      if (updates.published !== undefined) {
        updateData.publishedAt = updates.published ? new Date() : null;
      }

      return await BlogPost.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const result = await BlogPost.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // File methods
  async createFile(file: Partial<IFile>): Promise<IFile> {
    try {
      const newFile = new File(file);
      return await newFile.save();
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }

  async getFile(id: string): Promise<IFile | null> {
    try {
      return await File.findById(id);
    } catch (error) {
      console.error('Error getting file:', error);
      return null;
    }
  }

  async getFilesByUser(userId: string): Promise<IFile[]> {
    try {
      return await File.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting files by user:', error);
      return [];
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      const result = await File.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const storage = new MongoStorage();
