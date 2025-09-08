import { emailConfig, emailTemplates, companyInfo } from './email-config';
import { loadAndRenderTemplate, formatEmailDate } from './template-engine';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Mock email transporter (replace with real nodemailer when available)
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

const transporter = new MockEmailTransporter();

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
    const customerTemplatePath = path.join(__dirname, '../templates/contact-customer.html');
    const customerHtml = await loadAndRenderTemplate(customerTemplatePath, templateData);

    await transporter.sendMail({
      to: contact.email,
      subject: emailTemplates.contact.customerSubject,
      html: customerHtml,
      text: `Thank you for contacting IPEACE Legal Services. We have received your message and will get back to you soon.`,
    });

    // Send notification to company
    const companyTemplatePath = path.join(__dirname, '../templates/contact-company.html');
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

export async function sendAutoReply(email: string, firstName: string): Promise<void> {
  // This function is now handled by sendContactNotification
  // Keeping for backward compatibility
  console.log(`ℹ️ Auto-reply handled by sendContactNotification for ${firstName} at ${email}`);
}
