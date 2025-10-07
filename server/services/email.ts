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
      logoUrl: companyInfo.logo,
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
      logoUrl: companyInfo.logo,
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
      logoUrl: companyInfo.logo,
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

export async function sendContactResponse(contact: ContactNotification & { responseMessage: string }): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    // Prepare data for response template
    const templateData = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company || 'Not specified',
      service: contact.service || 'General inquiry',
      originalMessage: contact.message,
      responseMessage: contact.responseMessage,
      timestamp: formatEmailDate(new Date()),
      logoUrl: companyInfo.logo,
    };

    // Send personalized response email to customer
    const responseTemplatePath = path.join(projectRoot, 'server/templates/contact-response.html');
    const responseHtml = await loadAndRenderTemplate(responseTemplatePath, templateData);

    await transporter.sendMail({
      to: contact.email,
      subject: emailTemplates.contact.responseSubject || 'Personal Response to Your Inquiry - IPEACE Consultancy',
      html: responseHtml,
      text: `Dear ${contact.firstName} ${contact.lastName},\n\nOur Response:\n\n${contact.responseMessage}\n\nYour original message: ${contact.message}\n\nBest regards,\nThe IPEACE Consultancy Team`,
    });

    console.log('✅ Personalized contact response email sent successfully');
  } catch (error) {
    console.error('❌ Error sending personalized contact response email:', error);
    throw error;
  }
}

export async function sendAutoReply(email: string, firstName: string): Promise<void> {
  // This function is now handled by sendContactNotification
  // Keeping for backward compatibility
  console.log(`ℹ️ Auto-reply handled by sendContactNotification for ${firstName} at ${email}`);
}

export async function sendNewsletter(subject: string, content: string, subscriberEmails: string[]): Promise<{ success: number; failed: number }> {
  let successCount = 0;
  let failedCount = 0;

  console.log(`📧 Sending newsletter "${subject}" to ${subscriberEmails.length} subscribers`);

  for (const email of subscriberEmails) {
    try {
      const templateData = {
        subject: subject,
        content: content,
        unsubscribeUrl: `${process.env.FRONTEND_URL || 'https://ipeace-consultancy.com'}/unsubscribe?email=${encodeURIComponent(email)}`,
        logoUrl: companyInfo.logo,
      };

      // Send newsletter email
      const newsletterTemplatePath = path.join(projectRoot, 'server/templates/newsletter.html');
      const newsletterHtml = await loadAndRenderTemplate(newsletterTemplatePath, templateData);

      await transporter.sendMail({
        to: email,
        subject: subject,
        html: newsletterHtml,
        text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      successCount++;
      console.log(`✅ Newsletter sent to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send newsletter to ${email}:`, error);
      failedCount++;
    }
  }

  console.log(`📧 Newsletter sending complete. Success: ${successCount}, Failed: ${failedCount}`);
  return { success: successCount, failed: failedCount };
}

export async function sendEmailVerificationCode(email: string, firstName: string, verificationCode: string): Promise<boolean> {
  try {
    const templateData = {
      firstName: firstName,
      verificationCode: verificationCode,
      timestamp: formatEmailDate(new Date()),
      logoUrl: companyInfo.logo,
    };

    // Create a simple HTML template for verification email
    const verificationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification - IPEACE Consultancy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .code { font-size: 32px; font-weight: bold; color: #1e40af; text-align: center; margin: 20px 0; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${templateData.logoUrl}" alt="IPEACE Consultancy Logo" style="max-width: 150px; height: auto;">
              </div>
              <h1>IPEACE Consultancy</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>Welcome to IPEACE Consultancy! To complete your account setup and ensure the security of your account, please verify your email address.</p>

              <p>Your verification code is:</p>

              <div class="code">${verificationCode}</div>

              <p>This code will expire in 15 minutes for security reasons. If you didn't request this verification, please ignore this email.</p>

              <p>If you're having trouble copying the code, you can also verify your account by clicking the button below:</p>

              <p style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
              </p>

              <p>Thank you for choosing IPEACE Consultancy. We're excited to help you with your legal needs!</p>

              <div class="footer">
                <p>This verification code was sent on ${templateData.timestamp}</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      to: email,
      subject: 'Verify Your Email - IPEACE Consultancy',
      html: verificationHtml,
      text: `Hello ${firstName},\n\nYour email verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.\n\nWelcome to IPEACE Consultancy!`,
    });

    console.log(`✅ Email verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email verification code:', error);
    return false;
  }
}
