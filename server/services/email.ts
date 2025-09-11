import { emailConfig, emailTemplates, companyInfo } from './email-config';
import { loadAndRenderTemplate, formatEmailDate, formatEmailTime } from './template-engine';
import { getServiceTypeName, getConsultationTypeName } from './consultation';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface ContactNotification {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  newsletter: boolean;
}

// Mock email transporter (for development/testing)
class MockEmailTransporter {
  async sendMail(options: EmailOptions): Promise<void> {
    console.log('📧 EMAIL SENT (Mock):', {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html,
      timestamp: new Date().toISOString(),
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Real email transporter (for production - requires nodemailer)
class RealEmailTransporter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });
  }

  async sendMail(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
// Switch between mock and real transporter based on environment
const transporter = process.env.NODE_ENV === 'production'
  ? new RealEmailTransporter()
  : new MockEmailTransporter();

export async function sendContactNotification(contact: ContactNotification): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    // Prepare data for templates
    const templateData = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company || 'Not specified',
      service: contact.service || 'General inquiry',
      message: contact.message,
      newsletter: contact.newsletter ? 'Yes' : 'No',
      timestamp: formatEmailDate(new Date()),
    };

    // Send email to customer
    const customerTemplatePath = path.join(projectRoot, 'server/templates/contact-customer.html');
    console.log('🔍 Looking for customer template at:', customerTemplatePath);
    const customerHtml = await loadAndRenderTemplate(customerTemplatePath, templateData);

    await transporter.sendMail({
      to: contact.email,
      subject: emailTemplates.contact.customerSubject,
      html: customerHtml,
      text: `Thank you for contacting IPEACE Consultancy. We have received your message and will get back to you soon.`,
    });

    // Send notification to company
    const companyTemplatePath = path.join(projectRoot, 'server/templates/contact-company.html');
    const companyHtml = await loadAndRenderTemplate(companyTemplatePath, templateData);

    await transporter.sendMail({
      to: emailConfig.companyEmail,
      subject: emailTemplates.contact.companySubject,
      html: companyHtml,
      text: `New contact form submission from ${contact.firstName} ${contact.lastName}`,
    });

    console.log('✅ Contact form emails sent successfully');
  } catch (error) {
    console.error('❌ Error sending contact notification emails:', error);
    throw error;
  }
}

export async function sendContactConfirmation(contact: ContactNotification): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    // Prepare data for confirmation template
    const templateData = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company || 'Not specified',
      service: contact.service || 'General inquiry',
      message: contact.message,
      newsletter: contact.newsletter ? 'Yes' : 'No',
      timestamp: formatEmailDate(new Date()),
    };

    // Send confirmation email to customer
    const confirmationTemplatePath = path.join(projectRoot, 'server/templates/contact-confirmation.html');
    const confirmationHtml = await loadAndRenderTemplate(confirmationTemplatePath, templateData);

    await transporter.sendMail({
      to: contact.email,
      subject: emailTemplates.contact.confirmationSubject,
      html: confirmationHtml,
      text: `Your contact inquiry has been confirmed by IPEACE Consultancy. We will be in touch with you soon.`,
    });

    console.log('✅ Contact confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending contact confirmation email:', error);
    throw error;
  }
}

export async function sendConsultationConfirmationEmail(booking: any): Promise<void> {
  try {
    // Validate required parameters
    if (!booking.email || !booking.firstName || !booking.lastName) {
      console.log(`⚠️ Missing required parameters for consultation confirmation email`);
      return;
    }

    // Prepare data for customer template with safe fallbacks
    const templateData = {
      firstName: booking.firstName || 'Valued Customer',
      lastName: booking.lastName || 'Unknown',
      email: booking.email,
      phone: booking.phone || 'Not provided',
      company: booking.company || 'Not specified',
      serviceType: getServiceTypeName(booking.serviceType),
      consultationType: getConsultationTypeName(booking.consultationType),
      preferredDate: formatEmailDate(booking.preferredDate),
      preferredTime: formatEmailTime(booking.preferredTime),
      description: booking.description || 'No description provided',
      bookingId: booking._id?.toString() || 'TBD',
    };

    // Send confirmation email to customer
    const confirmationTemplatePath = path.join(projectRoot, 'server/templates/consultation-confirmation.html');
    const confirmationHtml = await loadAndRenderTemplate(confirmationTemplatePath, templateData);

    await transporter.sendMail({
      to: booking.email,
      subject: emailTemplates.consultation.confirmationSubject,
      html: confirmationHtml,
      text: `Your consultation booking has been confirmed. Booking ID: ${templateData.bookingId}`,
    });

    console.log('✅ Consultation confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending consultation confirmation email:', error);
    // Don't throw error to prevent workflow interruption
    console.log('⚠️ Continuing despite confirmation email failure');
  }
}

export async function sendAutoReply(email: string, firstName: string): Promise<void> {
  // This function is now handled by sendContactNotification
  // Keeping for backward compatibility
  console.log(`ℹ️ Auto-reply handled by sendContactNotification for ${firstName} at ${email}`);
}
