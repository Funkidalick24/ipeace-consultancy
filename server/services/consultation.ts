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

export async function sendConsultationBookingNotification(booking: ConsultationNotification): Promise<void> {
  // In a real implementation, this would use a service like Nodemailer with SMTP
  // For now, we'll log the notification
  console.log("Consultation booking received:", {
    from: `${booking.firstName} ${booking.lastName} <${booking.email}>`,
    phone: booking.phone,
    company: booking.company || "Not specified",
    serviceType: booking.serviceType,
    preferredDate: booking.preferredDate,
    preferredTime: booking.preferredTime,
    consultationType: booking.consultationType,
    description: booking.description,
    timestamp: new Date().toISOString(),
  });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function sendConsultationConfirmation(email: string, firstName: string, bookingId: number): Promise<void> {
  console.log(`Consultation confirmation sent to ${firstName} at ${email} for booking #${bookingId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
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