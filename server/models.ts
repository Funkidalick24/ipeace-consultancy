import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  role: 'admin' | 'client' | 'employee';
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationCode?: string;
  emailVerificationCodeExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client', 'employee'], default: 'client' },
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  company: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationCode: { type: String },
  emailVerificationCodeExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  lastLogin: { type: Date }
}, { timestamps: true });

// Contact submission interface and schema
export interface IContactSubmission extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  newsletter: boolean;
  status: 'pending' | 'responded';
  respondedAt?: Date;
  createdAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  service: { type: String },
  message: { type: String, required: true },
  newsletter: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'responded'],
    default: 'pending'
  },
  respondedAt: { type: Date }
}, { timestamps: true });

// Chat message interface and schema
export interface IChatMessage extends Document {
  _id: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sessionId: { type: String, required: true },
  userMessage: { type: String, required: true },
  aiResponse: { type: String, required: true }
}, { timestamps: true });

// Consultation booking interface and schema
export interface IConsultationBooking extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  serviceType: string;
  preferredDate: Date;
  preferredTime: string;
  consultationType: 'in-person' | 'video-call' | 'phone-call';
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationBookingSchema = new Schema<IConsultationBooking>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  serviceType: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  consultationType: {
    type: String,
    enum: ['in-person', 'video-call', 'phone-call'],
    required: true
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  calendarEventId: { type: String }
}, { timestamps: true });

// Blog post interface and schema
export interface IBlogPost extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: mongoose.Types.ObjectId;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date }
}, { timestamps: true });

// Static Page interface and schema for editable content
export interface IStaticPage extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: mongoose.Types.ObjectId;
}

const StaticPageSchema = new Schema<IStaticPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Testimonial interface and schema
export interface ITestimonial extends Document {
  _id: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true },
  position: { type: String },
  company: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  imageUrl: { type: String },
  published: { type: Boolean, default: false }
}, { timestamps: true });

// Team Member interface and schema
export interface ITeamMember extends Document {
  _id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  position: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  email: { type: String },
  linkedinUrl: { type: String },
  twitterUrl: { type: String },
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  websiteUrl: { type: String },
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// FAQ Item interface and schema
export interface IFAQItem extends Document {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FAQItemSchema = new Schema<IFAQItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String },
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// File/Image interface and schema for storing uploaded files
export interface IFile extends Document {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  data: Buffer;
  url: string;
  uploadedBy: mongoose.Types.ObjectId;
  // AI Training Data fields
  isTrainingData?: boolean;
  extractedText?: string;
  trainingEnabled?: boolean;
  // Client Portal fields
  isClientDocument?: boolean;
  consultationId?: mongoose.Types.ObjectId;
  sharedWithClients?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const FileSchema = new Schema<IFile>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // AI Training Data fields
  isTrainingData: { type: Boolean, default: false },
  extractedText: { type: String },
  trainingEnabled: { type: Boolean, default: false },
  // Client Portal fields
  isClientDocument: { type: Boolean, default: false },
  consultationId: { type: Schema.Types.ObjectId, ref: 'ConsultationBooking' },
  sharedWithClients: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Client Profile interface and schema
export interface IClientProfile extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  businessType?: string;
  industry?: string;
  companySize?: string;
  legalNeeds?: string[];
  preferredContactMethod: 'email' | 'phone' | 'both';
  timezone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  taxId?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessType: { type: String },
  industry: { type: String },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'] },
  legalNeeds: [{ type: String }],
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  timezone: { type: String, default: 'Africa/Harare' },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  taxId: { type: String },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  }
}, { timestamps: true });

// Conversation interface and schema for message threads
export interface IConversation extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[];
  subject: string;
  lastMessage?: {
    content: string;
    fromUserId: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  messageCount: number;
  unreadCount: { [userId: string]: number };
  conversationType: 'direct' | 'group' | 'support';
  relatedConsultationId?: mongoose.Types.ObjectId;
  relatedInvoiceId?: mongoose.Types.ObjectId;
  relatedFileId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  subject: { type: String, required: true },
  lastMessage: {
    content: { type: String },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date }
  },
  messageCount: { type: Number, default: 0 },
  unreadCount: { type: Schema.Types.Mixed, default: {} },
  conversationType: {
    type: String,
    enum: ['direct', 'group', 'support'],
    default: 'direct'
  },
  relatedConsultationId: { type: Schema.Types.ObjectId, ref: 'ConsultationBooking' },
  relatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  relatedFileId: { type: Schema.Types.ObjectId, ref: 'File' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Message interface and schema for client communications
export interface IMessage extends Document {
  _id: string;
  conversationId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'general' | 'consultation' | 'invoice' | 'document' | 'system';
  relatedConsultationId?: mongoose.Types.ObjectId;
  relatedInvoiceId?: mongoose.Types.ObjectId;
  relatedFileId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  attachments?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ['general', 'consultation', 'invoice', 'document', 'system'],
    default: 'general'
  },
  relatedConsultationId: { type: Schema.Types.ObjectId, ref: 'ConsultationBooking' },
  relatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  relatedFileId: { type: Schema.Types.ObjectId, ref: 'File' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  attachments: [{ type: Schema.Types.ObjectId, ref: 'File' }]
}, { timestamps: true });

// Invoice interface and schema
export interface IInvoice extends Document {
  _id: string;
  invoiceNumber: string;
  clientId: mongoose.Types.ObjectId;
  consultationId?: mongoose.Types.ObjectId;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  consultationId: { type: Schema.Types.ObjectId, ref: 'ConsultationBooking' },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, required: true, min: 0, default: 0 },
  taxAmount: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  paymentMethod: { type: String },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Newsletter Subscriber interface and schema
export interface INewsletterSubscriber extends Document {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  source: 'contact-form' | 'consultation-form' | 'website-signup' | 'admin-added';
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>({
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  source: {
    type: String,
    enum: ['contact-form', 'consultation-form', 'website-signup', 'admin-added'],
    default: 'contact-form'
  },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date }
}, { timestamps: true });

// Resource interface and schema for legal resources
export interface IResource extends Document {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: 'template' | 'guide' | 'article' | 'checklist' | 'regulation';
  serviceType?: string;
  tags: string[];
  fileUrl?: string;
  isPublished: boolean;
  isPremium: boolean;
  accessLevel: 'all' | 'client' | 'consultation-clients';
  downloadCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String },
  category: {
    type: String,
    enum: ['template', 'guide', 'article', 'checklist', 'regulation'],
    required: true
  },
  serviceType: { type: String },
  tags: [{ type: String }],
  fileUrl: { type: String },
  isPublished: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  accessLevel: {
    type: String,
    enum: ['all', 'client', 'consultation-clients'],
    default: 'client'
  },
  downloadCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Create models
export const User = mongoose.model<IUser>('User', UserSchema);
export const ContactSubmission = mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export const ConsultationBooking = mongoose.model<IConsultationBooking>('ConsultationBooking', ConsultationBookingSchema);
export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
export const StaticPage = mongoose.model<IStaticPage>('StaticPage', StaticPageSchema);
export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export const FAQItem = mongoose.model<IFAQItem>('FAQItem', FAQItemSchema);
export const File = mongoose.model<IFile>('File', FileSchema);
export const ClientProfile = mongoose.model<IClientProfile>('ClientProfile', ClientProfileSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
export const NewsletterSubscriber = mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);