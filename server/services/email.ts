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

export async function sendContactNotification(contact: ContactNotification): Promise<void> {
  // In a real implementation, this would use a service like Nodemailer with SMTP
  // For now, we'll log the notification
  console.log("Contact form submission received:", {
    from: `${contact.firstName} ${contact.lastName} <${contact.email}>`,
    company: contact.company || "Not specified",
    service: contact.service || "General inquiry",
    message: contact.message,
    newsletter: contact.newsletter ? "Yes" : "No",
    timestamp: new Date().toISOString(),
  });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function sendAutoReply(email: string, firstName: string): Promise<void> {
  console.log(`Auto-reply sent to ${firstName} at ${email}`);
  await new Promise(resolve => setTimeout(resolve, 50));
}
