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

export const emailConfig: EmailConfig = {
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
  website: 'https://ipeace-consultancy.com',
  logo: 'https://ipeace-consultancy.com/logo.png',
};