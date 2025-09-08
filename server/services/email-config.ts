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
  from: process.env.FROM_EMAIL || 'IPEACE Legal Services <noreply@ipeace.co.zw>',
  companyEmail: process.env.COMPANY_EMAIL || 'info@ipeace.co.zw',
};

// Email templates configuration
export const emailTemplates = {
  contact: {
    customerSubject: 'Thank you for contacting IPEACE Legal Services',
    companySubject: 'New Contact Form Submission - IPEACE Legal Services',
  },
  consultation: {
    customerSubject: 'Consultation Booking Confirmation - IPEACE Legal Services',
    companySubject: 'New Consultation Booking - IPEACE Legal Services',
  },
};

// Company information for emails
export const companyInfo = {
  name: 'IPEACE Legal Services',
  address: '135 Baines Avenue, Avenues, Harare, Zimbabwe',
  phone: '+263 4 123 4567',
  email: 'info@ipeace.co.zw',
  website: 'https://ipeace.co.zw',
  logo: 'https://ipeace.co.zw/logo.png',
};