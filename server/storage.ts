import { User, ContactSubmission, ChatMessage, ConsultationBooking, BlogPost, StaticPage, Testimonial, TeamMember, FAQItem, File, ClientProfile, Message, Invoice, Resource, NewsletterSubscriber, IUser, IContactSubmission, IChatMessage, IConsultationBooking, IBlogPost, IStaticPage, ITestimonial, ITeamMember, IFAQItem, IFile, IClientProfile, IMessage, IInvoice, IResource, INewsletterSubscriber } from "./models";
import { type InsertUser, type InsertContact, type InsertConsultation, type InsertBlogPost } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUserRole(id: string, role: string): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
  createContactSubmission(contact: InsertContact): Promise<IContactSubmission>;
  getAllContactSubmissions(): Promise<IContactSubmission[]>;
  getContactSubmission(id: string): Promise<IContactSubmission | null>;
  updateContactSubmissionStatus(id: string, status: string): Promise<IContactSubmission | null>;
  createChatMessage(sessionId: string, userMessage: string, aiResponse: string): Promise<IChatMessage>;
  getChatHistory(sessionId: string): Promise<IChatMessage[]>;
  createConsultationBooking(booking: InsertConsultation): Promise<IConsultationBooking>;
  getAllConsultationBookings(): Promise<IConsultationBooking[]>;
  getConsultationBooking(id: string): Promise<IConsultationBooking | null>;
  updateConsultationBookingStatus(id: string, status: string): Promise<IConsultationBooking | null>;
  updateConsultationBooking(id: string, updates: Partial<IConsultationBooking>): Promise<IConsultationBooking | null>;
  // Blog methods
  createBlogPost(blogPost: InsertBlogPost): Promise<IBlogPost>;
  getBlogPost(id: string): Promise<IBlogPost | null>;
  getBlogPostBySlug(slug: string): Promise<IBlogPost | null>;
  getAllBlogPosts(): Promise<IBlogPost[]>;
  getPublishedBlogPosts(): Promise<IBlogPost[]>;
  updateBlogPost(id: string, blogPost: Partial<InsertBlogPost>): Promise<IBlogPost | null>;
  deleteBlogPost(id: string): Promise<boolean>;
  // Content management methods
  createStaticPage(page: Partial<IStaticPage>): Promise<IStaticPage>;
  getStaticPage(id: string): Promise<IStaticPage | null>;
  getStaticPageBySlug(slug: string): Promise<IStaticPage | null>;
  getAllStaticPages(): Promise<IStaticPage[]>;
  getPublishedStaticPages(): Promise<IStaticPage[]>;
  updateStaticPage(id: string, page: Partial<IStaticPage>): Promise<IStaticPage | null>;
  deleteStaticPage(id: string): Promise<boolean>;

  createTestimonial(testimonial: Partial<ITestimonial>): Promise<ITestimonial>;
  getTestimonial(id: string): Promise<ITestimonial | null>;
  getAllTestimonials(): Promise<ITestimonial[]>;
  getPublishedTestimonials(): Promise<ITestimonial[]>;
  updateTestimonial(id: string, testimonial: Partial<ITestimonial>): Promise<ITestimonial | null>;
  deleteTestimonial(id: string): Promise<boolean>;

  createTeamMember(member: Partial<ITeamMember>): Promise<ITeamMember>;
  getTeamMember(id: string): Promise<ITeamMember | null>;
  getAllTeamMembers(): Promise<ITeamMember[]>;
  getPublishedTeamMembers(): Promise<ITeamMember[]>;
  updateTeamMember(id: string, member: Partial<ITeamMember>): Promise<ITeamMember | null>;
  deleteTeamMember(id: string): Promise<boolean>;

  createFAQItem(item: Partial<IFAQItem>): Promise<IFAQItem>;
  getFAQItem(id: string): Promise<IFAQItem | null>;
  getAllFAQItems(): Promise<IFAQItem[]>;
  getPublishedFAQItems(): Promise<IFAQItem[]>;
  updateFAQItem(id: string, item: Partial<IFAQItem>): Promise<IFAQItem | null>;
  deleteFAQItem(id: string): Promise<boolean>;

  // File methods
  createFile(file: Partial<IFile>): Promise<IFile>;
  getFile(id: string): Promise<IFile | null>;
  getFilesByUser(userId: string): Promise<IFile[]>;
  getTrainingFiles(): Promise<IFile[]>;
  updateFileTrainingStatus(id: string, isTrainingData: boolean, trainingEnabled?: boolean): Promise<IFile | null>;
  deleteFile(id: string): Promise<boolean>;

  // Client Portal methods
  // Client Profile methods
  createClientProfile(profile: Partial<IClientProfile>): Promise<IClientProfile>;
  getClientProfile(userId: string): Promise<IClientProfile | null>;
  updateClientProfile(userId: string, updates: Partial<IClientProfile>): Promise<IClientProfile | null>;

  // Message methods
  createMessage(message: Partial<IMessage>): Promise<IMessage>;
  getMessagesForUser(userId: string): Promise<IMessage[]>;
  getMessage(id: string): Promise<IMessage | null>;
  markMessageAsRead(id: string): Promise<IMessage | null>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Invoice methods
  createInvoice(invoice: Partial<IInvoice>): Promise<IInvoice>;
  getInvoicesForClient(clientId: string): Promise<IInvoice[]>;
  getInvoice(id: string): Promise<IInvoice | null>;
  updateInvoiceStatus(id: string, status: string, paidAt?: Date, paymentMethod?: string): Promise<IInvoice | null>;

  // Resource methods
  createResource(resource: Partial<IResource>): Promise<IResource>;
  getResourcesForClients(): Promise<IResource[]>;
  getResource(id: string): Promise<IResource | null>;
  incrementResourceDownloadCount(id: string): Promise<IResource | null>;
  searchResources(query: string, category?: string): Promise<IResource[]>;

  // Client-specific consultation methods
  getConsultationsForClient(clientId: string): Promise<IConsultationBooking[]>;

  // Client-specific file methods
  getClientDocuments(clientId: string): Promise<IFile[]>;
  shareFileWithClient(fileId: string, clientId: string): Promise<IFile | null>;

  // Newsletter subscriber methods
  createNewsletterSubscriber(subscriber: Partial<INewsletterSubscriber>): Promise<INewsletterSubscriber>;
  getNewsletterSubscriber(email: string): Promise<INewsletterSubscriber | null>;
  getAllNewsletterSubscribers(): Promise<INewsletterSubscriber[]>;
  getActiveNewsletterSubscribers(): Promise<INewsletterSubscriber[]>;
  updateNewsletterSubscriber(email: string, updates: Partial<INewsletterSubscriber>): Promise<INewsletterSubscriber | null>;
  deleteNewsletterSubscriber(email: string): Promise<boolean>;
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

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error getting user by email:', error);
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

  async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUserRole(id: string, role: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
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

  async getAllContactSubmissions(): Promise<IContactSubmission[]> {
    try {
      return await ContactSubmission.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all contact submissions:', error);
      return [];
    }
  }

  async getContactSubmission(id: string): Promise<IContactSubmission | null> {
    try {
      return await ContactSubmission.findById(id);
    } catch (error) {
      console.error('Error getting contact submission:', error);
      return null;
    }
  }

  async updateContactSubmissionStatus(id: string, status: string): Promise<IContactSubmission | null> {
    try {
      const updateData: any = { status };
      if (status === 'responded') {
        updateData.respondedAt = new Date();
      }
      return await ContactSubmission.findByIdAndUpdate(id, updateData, { new: true }).lean();
    } catch (error) {
      console.error('Error updating contact submission status:', error);
      return null;
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
      return await ConsultationBooking.find().sort({ createdAt: -1 }).lean();
    } catch (error) {
      console.error('Error getting consultation bookings:', error);
      return [];
    }
  }

  async getConsultationBooking(id: string): Promise<IConsultationBooking | null> {
    try {
      return await ConsultationBooking.findById(id).lean();
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
      ).lean();
    } catch (error) {
      console.error('Error updating consultation booking status:', error);
      return null;
    }
  }

  async updateConsultationBooking(id: string, updates: Partial<IConsultationBooking>): Promise<IConsultationBooking | null> {
    try {
      return await ConsultationBooking.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean();
    } catch (error) {
      console.error('Error updating consultation booking:', error);
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

  async getTrainingFiles(): Promise<IFile[]> {
    try {
      return await File.find({ isTrainingData: true }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting training files:', error);
      return [];
    }
  }

  async updateFileTrainingStatus(id: string, isTrainingData: boolean, trainingEnabled?: boolean): Promise<IFile | null> {
    try {
      const updateData: any = { isTrainingData };
      if (trainingEnabled !== undefined) {
        updateData.trainingEnabled = trainingEnabled;
      }
      return await File.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating file training status:', error);
      return null;
    }
  }

  // Content management methods
  async createStaticPage(page: Partial<IStaticPage>): Promise<IStaticPage> {
    try {
      const staticPage = new StaticPage({
        ...page,
        excerpt: page.excerpt || undefined,
        published: page.published || false,
        publishedAt: page.published ? new Date() : undefined
      });
      return await staticPage.save();
    } catch (error) {
      console.error('Error creating static page:', error);
      throw error;
    }
  }

  async getStaticPage(id: string): Promise<IStaticPage | null> {
    try {
      return await StaticPage.findById(id);
    } catch (error) {
      console.error('Error getting static page:', error);
      return null;
    }
  }

  async getStaticPageBySlug(slug: string): Promise<IStaticPage | null> {
    try {
      return await StaticPage.findOne({ slug });
    } catch (error) {
      console.error('Error getting static page by slug:', error);
      return null;
    }
  }

  async getAllStaticPages(): Promise<IStaticPage[]> {
    try {
      return await StaticPage.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all static pages:', error);
      return [];
    }
  }

  async getPublishedStaticPages(): Promise<IStaticPage[]> {
    try {
      return await StaticPage.find({ published: true }).sort({ publishedAt: -1 });
    } catch (error) {
      console.error('Error getting published static pages:', error);
      return [];
    }
  }

  async updateStaticPage(id: string, updates: Partial<IStaticPage>): Promise<IStaticPage | null> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };

      if (updates.published !== undefined) {
        updateData.publishedAt = updates.published ? new Date() : null;
      }

      return await StaticPage.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating static page:', error);
      return null;
    }
  }

  async deleteStaticPage(id: string): Promise<boolean> {
    try {
      const result = await StaticPage.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting static page:', error);
      return false;
    }
  }

  async createTestimonial(testimonial: Partial<ITestimonial>): Promise<ITestimonial> {
    try {
      const newTestimonial = new Testimonial({
        ...testimonial,
        rating: testimonial.rating || undefined,
        published: testimonial.published || false
      });
      return await newTestimonial.save();
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async getTestimonial(id: string): Promise<ITestimonial | null> {
    try {
      return await Testimonial.findById(id);
    } catch (error) {
      console.error('Error getting testimonial:', error);
      return null;
    }
  }

  async getAllTestimonials(): Promise<ITestimonial[]> {
    try {
      return await Testimonial.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all testimonials:', error);
      return [];
    }
  }

  async getPublishedTestimonials(): Promise<ITestimonial[]> {
    try {
      return await Testimonial.find({ published: true }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting published testimonials:', error);
      return [];
    }
  }

  async updateTestimonial(id: string, updates: Partial<ITestimonial>): Promise<ITestimonial | null> {
    try {
      return await Testimonial.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      return null;
    }
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    try {
      const result = await Testimonial.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return false;
    }
  }

  async createTeamMember(member: Partial<ITeamMember>): Promise<ITeamMember> {
    try {
      const newMember = new TeamMember({
        ...member,
        order: member.order || 0,
        published: member.published || false
      });
      return await newMember.save();
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  }

  async getTeamMember(id: string): Promise<ITeamMember | null> {
    try {
      return await TeamMember.findById(id);
    } catch (error) {
      console.error('Error getting team member:', error);
      return null;
    }
  }

  async getAllTeamMembers(): Promise<ITeamMember[]> {
    try {
      return await TeamMember.find().sort({ order: 1, createdAt: -1 });
    } catch (error) {
      console.error('Error getting all team members:', error);
      return [];
    }
  }

  async getPublishedTeamMembers(): Promise<ITeamMember[]> {
    try {
      return await TeamMember.find({ published: true }).sort({ order: 1, createdAt: -1 });
    } catch (error) {
      console.error('Error getting published team members:', error);
      return [];
    }
  }

  async updateTeamMember(id: string, updates: Partial<ITeamMember>): Promise<ITeamMember | null> {
    try {
      return await TeamMember.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
    } catch (error) {
      console.error('Error updating team member:', error);
      return null;
    }
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      const result = await TeamMember.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
  }

  async createFAQItem(item: Partial<IFAQItem>): Promise<IFAQItem> {
    try {
      const newItem = new FAQItem({
        ...item,
        order: item.order || 0,
        published: item.published || false
      });
      return await newItem.save();
    } catch (error) {
      console.error('Error creating FAQ item:', error);
      throw error;
    }
  }

  async getFAQItem(id: string): Promise<IFAQItem | null> {
    try {
      return await FAQItem.findById(id);
    } catch (error) {
      console.error('Error getting FAQ item:', error);
      return null;
    }
  }

  async getAllFAQItems(): Promise<IFAQItem[]> {
    try {
      return await FAQItem.find().sort({ order: 1, createdAt: -1 });
    } catch (error) {
      console.error('Error getting all FAQ items:', error);
      return [];
    }
  }

  async getPublishedFAQItems(): Promise<IFAQItem[]> {
    try {
      return await FAQItem.find({ published: true }).sort({ order: 1, createdAt: -1 });
    } catch (error) {
      console.error('Error getting published FAQ items:', error);
      return [];
    }
  }

  async updateFAQItem(id: string, updates: Partial<IFAQItem>): Promise<IFAQItem | null> {
    try {
      return await FAQItem.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
    } catch (error) {
      console.error('Error updating FAQ item:', error);
      return null;
    }
  }

  async deleteFAQItem(id: string): Promise<boolean> {
    try {
      const result = await FAQItem.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      return false;
    }
  }

  // Client Portal methods
  // Client Profile methods
  async createClientProfile(profile: Partial<IClientProfile>): Promise<IClientProfile> {
    try {
      const clientProfile = new ClientProfile(profile);
      return await clientProfile.save();
    } catch (error) {
      console.error('Error creating client profile:', error);
      throw error;
    }
  }

  async getClientProfile(userId: string): Promise<IClientProfile | null> {
    try {
      return await ClientProfile.findOne({ userId });
    } catch (error) {
      console.error('Error getting client profile:', error);
      return null;
    }
  }

  async updateClientProfile(userId: string, updates: Partial<IClientProfile>): Promise<IClientProfile | null> {
    try {
      return await ClientProfile.findOneAndUpdate(
        { userId },
        { ...updates, updatedAt: new Date() },
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error updating client profile:', error);
      return null;
    }
  }

  // Message methods
  async createMessage(message: Partial<IMessage>): Promise<IMessage> {
    try {
      const newMessage = new Message(message);
      return await newMessage.save();
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesForUser(userId: string): Promise<IMessage[]> {
    try {
      return await Message.find({
        $or: [{ fromUserId: userId }, { toUserId: userId }]
      })
        .populate('fromUserId', 'firstName lastName email')
        .populate('toUserId', 'firstName lastName email')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting messages for user:', error);
      return [];
    }
  }

  async getMessage(id: string): Promise<IMessage | null> {
    try {
      return await Message.findById(id)
        .populate('fromUserId', 'firstName lastName email')
        .populate('toUserId', 'firstName lastName email');
    } catch (error) {
      console.error('Error getting message:', error);
      return null;
    }
  }

  async markMessageAsRead(id: string): Promise<IMessage | null> {
    try {
      return await Message.findByIdAndUpdate(
        id,
        { isRead: true, readAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
      return null;
    }
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      return await Message.countDocuments({
        toUserId: userId,
        isRead: false
      });
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  // Invoice methods
  async createInvoice(invoice: Partial<IInvoice>): Promise<IInvoice> {
    try {
      const newInvoice = new Invoice({
        ...invoice,
        status: invoice.status || 'draft'
      });
      return await newInvoice.save();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getInvoicesForClient(clientId: string): Promise<IInvoice[]> {
    try {
      return await Invoice.find({ clientId })
        .populate('clientId', 'firstName lastName email company')
        .populate('consultationId')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting invoices for client:', error);
      return [];
    }
  }

  async getInvoice(id: string): Promise<IInvoice | null> {
    try {
      return await Invoice.findById(id)
        .populate('clientId', 'firstName lastName email company')
        .populate('consultationId')
        .populate('createdBy', 'firstName lastName');
    } catch (error) {
      console.error('Error getting invoice:', error);
      return null;
    }
  }

  async updateInvoiceStatus(id: string, status: string, paidAt?: Date, paymentMethod?: string): Promise<IInvoice | null> {
    try {
      const updateData: any = { status };
      if (paidAt) updateData.paidAt = paidAt;
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      return await Invoice.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return null;
    }
  }

  // Resource methods
  async createResource(resource: Partial<IResource>): Promise<IResource> {
    try {
      const newResource = new Resource({
        ...resource,
        downloadCount: resource.downloadCount || 0,
        isPublished: resource.isPublished || false,
        isPremium: resource.isPremium || false
      });
      return await newResource.save();
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async getResourcesForClients(): Promise<IResource[]> {
    try {
      return await Resource.find({
        isPublished: true,
        accessLevel: { $in: ['all', 'client'] }
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting resources for clients:', error);
      return [];
    }
  }

  async getResource(id: string): Promise<IResource | null> {
    try {
      return await Resource.findById(id);
    } catch (error) {
      console.error('Error getting resource:', error);
      return null;
    }
  }

  async incrementResourceDownloadCount(id: string): Promise<IResource | null> {
    try {
      return await Resource.findByIdAndUpdate(
        id,
        { $inc: { downloadCount: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error('Error incrementing resource download count:', error);
      return null;
    }
  }

  async searchResources(query: string, category?: string): Promise<IResource[]> {
    try {
      const searchQuery: any = {
        isPublished: true,
        accessLevel: { $in: ['all', 'client'] }
      };

      if (category) {
        searchQuery.category = category;
      }

      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ];
      }

      return await Resource.find(searchQuery).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error searching resources:', error);
      return [];
    }
  }

  // Client-specific consultation methods
  async getConsultationsForClient(clientId: string): Promise<IConsultationBooking[]> {
    try {
      // Find consultations by matching email/phone with user data
      const user = await User.findById(clientId);
      if (!user) return [];

      return await ConsultationBooking.find({
        $or: [
          { email: user.email },
          { phone: user.phone }
        ]
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting consultations for client:', error);
      return [];
    }
  }

  // Client-specific file methods
  async getClientDocuments(clientId: string): Promise<IFile[]> {
    try {
      return await File.find({
        $or: [
          { uploadedBy: clientId },
          { sharedWithClients: clientId },
          { isClientDocument: true }
        ]
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting client documents:', error);
      return [];
    }
  }

  async shareFileWithClient(fileId: string, clientId: string): Promise<IFile | null> {
    try {
      return await File.findByIdAndUpdate(
        fileId,
        { $addToSet: { sharedWithClients: clientId } },
        { new: true }
      );
    } catch (error) {
      console.error('Error sharing file with client:', error);
      return null;
    }
  }

  // Newsletter subscriber methods
  async createNewsletterSubscriber(subscriber: Partial<INewsletterSubscriber>): Promise<INewsletterSubscriber> {
    try {
      const newSubscriber = new NewsletterSubscriber({
        ...subscriber,
        isActive: subscriber.isActive !== undefined ? subscriber.isActive : true,
        subscribedAt: subscriber.subscribedAt || new Date()
      });
      return await newSubscriber.save();
    } catch (error) {
      console.error('Error creating newsletter subscriber:', error);
      throw error;
    }
  }

  async getNewsletterSubscriber(email: string): Promise<INewsletterSubscriber | null> {
    try {
      return await NewsletterSubscriber.findOne({ email });
    } catch (error) {
      console.error('Error getting newsletter subscriber:', error);
      return null;
    }
  }

  async getAllNewsletterSubscribers(): Promise<INewsletterSubscriber[]> {
    try {
      return await NewsletterSubscriber.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all newsletter subscribers:', error);
      return [];
    }
  }

  async getActiveNewsletterSubscribers(): Promise<INewsletterSubscriber[]> {
    try {
      return await NewsletterSubscriber.find({ isActive: true }).sort({ subscribedAt: -1 });
    } catch (error) {
      console.error('Error getting active newsletter subscribers:', error);
      return [];
    }
  }

  async updateNewsletterSubscriber(email: string, updates: Partial<INewsletterSubscriber>): Promise<INewsletterSubscriber | null> {
    try {
      return await NewsletterSubscriber.findOneAndUpdate(
        { email },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating newsletter subscriber:', error);
      return null;
    }
  }

  async deleteNewsletterSubscriber(email: string): Promise<boolean> {
    try {
      const result = await NewsletterSubscriber.findOneAndDelete({ email });
      return !!result;
    } catch (error) {
      console.error('Error deleting newsletter subscriber:', error);
      return false;
    }
  }
}

export const storage = new MongoStorage();
