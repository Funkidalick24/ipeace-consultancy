export interface ConsultationNotification {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  description: string;
}

import { emailConfig, emailTemplates } from './email-config';
import { loadAndRenderTemplate, formatEmailDate, formatEmailTime } from './template-engine';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock email transporter (replace with real nodemailer when available)
class MockEmailTransporter {
  async sendMail(options: any): Promise<void> {
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

const transporter = new MockEmailTransporter();

export async function sendConsultationBookingNotification(booking: ConsultationNotification): Promise<void> {
  try {
    // Validate required booking data
    if (!booking.firstName || !booking.lastName || !booking.email || !booking.phone) {
      throw new Error('Missing required booking information for notification');
    }

    const timestamp = new Date().toISOString();

    // Prepare data for templates with safe fallbacks
    const templateData = {
      firstName: booking.firstName || 'Unknown',
      lastName: booking.lastName || 'Unknown',
      email: booking.email || 'Not provided',
      phone: booking.phone || 'Not provided',
      company: booking.company || 'Not specified',
      serviceType: getServiceTypeName(booking.serviceType),
      consultationType: getConsultationTypeName(booking.consultationType),
      preferredDate: formatEmailDate(booking.preferredDate),
      preferredTime: formatEmailTime(booking.preferredTime),
      description: booking.description || 'No description provided',
      timestamp: formatEmailDate(new Date()),
    };

    // Send notification to company
    const companyTemplatePath = path.join(__dirname, '../templates/consultation-company.html');
    const companyHtml = await loadAndRenderTemplate(companyTemplatePath, templateData);

    await transporter.sendMail({
      to: emailConfig.companyEmail,
      subject: emailTemplates.consultation.companySubject,
      html: companyHtml,
      text: `New consultation booking from ${booking.firstName} ${booking.lastName} for ${templateData.serviceType}`,
    });

    console.log('✅ Consultation company notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending consultation company notification:', error);
    // Don't throw error to prevent booking failure due to email issues
    console.log('⚠️ Continuing with booking despite email notification failure');
  }
}

export async function sendConsultationConfirmation(email: string, firstName: string, bookingId: string, booking?: any): Promise<void> {
  try {
    // Validate required parameters
    if (!email || !firstName || !bookingId) {
      console.log(`⚠️ Missing required parameters for confirmation email: email=${!!email}, firstName=${!!firstName}, bookingId=${!!bookingId}`);
      return;
    }

    if (!booking) {
      console.log(`⚠️ Booking data not provided for confirmation email to ${firstName} at ${email}`);
      return;
    }

    // Prepare data for customer template with safe fallbacks
    const templateData = {
      firstName: firstName || 'Valued Customer',
      lastName: booking.lastName || 'Unknown',
      email: email,
      phone: booking.phone || 'Not provided',
      company: booking.company || 'Not specified',
      serviceType: getServiceTypeName(booking.serviceType),
      consultationType: getConsultationTypeName(booking.consultationType),
      preferredDate: formatEmailDate(booking.preferredDate),
      preferredTime: formatEmailTime(booking.preferredTime),
      description: booking.description || 'No description provided',
      bookingId: bookingId,
    };

    // Send confirmation to customer
    const customerTemplatePath = path.join(__dirname, '../templates/consultation-customer.html');
    const customerHtml = await loadAndRenderTemplate(customerTemplatePath, templateData);

    await transporter.sendMail({
      to: email,
      subject: emailTemplates.consultation.customerSubject,
      html: customerHtml,
      text: `Your consultation booking #${bookingId} has been confirmed. We'll contact you soon to finalize details.`,
    });

    console.log('✅ Consultation customer confirmation sent successfully');
  } catch (error) {
    console.error('❌ Error sending consultation confirmation:', error);
    // Don't throw error to prevent booking failure due to email issues
    console.log('⚠️ Continuing with booking despite customer confirmation email failure');
  }
}

export function getServiceTypeName(serviceType: string): string {
  const serviceNames: Record<string, string> = {
    regulatory: "Regulatory Compliance",
    ai: "AI-Powered Advisory",
    strategy: "Business Strategy",
    training: "Training & Development",
    documents: "Document Services",
    support: "24/7 Support",
  };
  return serviceNames[serviceType] || serviceType;
}

export function getConsultationTypeName(consultationType: string): string {
  const consultationNames: Record<string, string> = {
    "in-person": "In-Person Meeting",
    "video-call": "Video Call",
    "phone-call": "Phone Call",
  };
  return consultationNames[consultationType] || consultationType;
}