import mongoose, { Schema, Document } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
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
  createdAt: Date;
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
  }
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
  trainingEnabled: { type: Boolean, default: false }
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