// Email configuration for IPEACE Legal Services
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  companyEmail: string;
}

// Brevo (Sendinblue) SMTP configuration
const useBrevo = process.env.USE_BREVO === 'true' || process.env.BREVO_API_KEY;

export const emailConfig: EmailConfig = useBrevo ? {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_EMAIL || process.env.SMTP_USER || '',
    pass: process.env.BREVO_API_KEY || process.env.SMTP_PASS || '',
  },
  from: process.env.FROM_EMAIL || `IPEACE Consultancy <${process.env.BREVO_EMAIL || 'noreply@ipeace-consultancy.com'}>`,
  companyEmail: process.env.COMPANY_EMAIL || 'info@ipeace-consultancy.com',
} : {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.FROM_EMAIL || 'IPEACE Consultancy <noreply@ipeace-consultancy.com>',
  companyEmail: process.env.COMPANY_EMAIL || 'info@ipeace-consultancy.com',
};

// Email templates configuration
export const emailTemplates = {
  contact: {
    customerSubject: 'Thank you for contacting IPEACE Consultancy',
    companySubject: 'New Contact Form Submission - IPEACE Consultancy',
    confirmationSubject: 'Contact Confirmed - IPEACE Consultancy',
    responseSubject: 'Personal Response to Your Inquiry - IPEACE Consultancy',
  },
  consultation: {
    customerSubject: 'Consultation Booking Confirmation - IPEACE Consultancy',
    companySubject: 'New Consultation Booking - IPEACE Consultancy',
    confirmationSubject: 'Consultation Confirmed - IPEACE Consultancy',
  },
};

// Company information for emails
export const companyInfo = {
  name: 'IPEACE Consultancy',
  address: '135 Baines Avenue, Avenues, Harare, Zimbabwe',
  phone: '+263 4 123 4567',
  email: 'info@ipeace-consultancy.com',
  website: process.env.FRONTEND_URL || 'https://ipeace-consultancy.com',
  logo: `${process.env.FRONTEND_URL || 'https://ipeace-consultancy.com'}/logo.png`,
};