// Microsoft Calendar Integration Service
// Note: Requires @microsoft/microsoft-graph-client and @azure/identity packages
// Run: npm install @microsoft/microsoft-graph-client @azure/identity

import { ConsultationBooking } from '../../shared/schema';

// Type definitions for optional Microsoft Graph packages
type GraphClient = any;
type ClientSecretCredentialType = any;
type TokenCredentialAuthenticationProviderType = any;

export interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
    type: 'required' | 'optional';
  }>;
}

export class MicrosoftCalendarService {
  private client: any = null;
  private initialized = false;
  private Client: GraphClient | null = null;
  private ClientSecretCredential: ClientSecretCredentialType | null = null;
  private TokenCredentialAuthenticationProvider: TokenCredentialAuthenticationProviderType | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Try to import Microsoft Graph packages
      try {
        const graphClient = await import('@microsoft/microsoft-graph-client');
        const azureIdentity = await import('@azure/identity');
        const authProviders = await import('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

        this.Client = graphClient.Client;
        this.ClientSecretCredential = azureIdentity.ClientSecretCredential;
        this.TokenCredentialAuthenticationProvider = authProviders.TokenCredentialAuthenticationProvider;
      } catch (importError) {
        console.log('⚠️ Microsoft Graph packages not installed. Calendar integration will be disabled.');
        console.log('To enable calendar integration, run: npm install @microsoft/microsoft-graph-client @azure/identity');
        return;
      }

      if (!process.env.MICROSOFT_CLIENT_ID ||
          !process.env.MICROSOFT_CLIENT_SECRET ||
          !process.env.MICROSOFT_TENANT_ID) {
        console.warn('⚠️ Microsoft Calendar: Missing required environment variables');
        return;
      }

      if (!this.ClientSecretCredential || !this.TokenCredentialAuthenticationProvider || !this.Client) {
        console.warn('⚠️ Microsoft Calendar: Required classes not available');
        return;
      }

      const credential = new this.ClientSecretCredential(
        process.env.MICROSOFT_TENANT_ID,
        process.env.MICROSOFT_CLIENT_ID,
        process.env.MICROSOFT_CLIENT_SECRET
      );

      const authProvider = new this.TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default']
      });

      this.client = this.Client.initWithMiddleware({
        authProvider: authProvider
      });

      this.initialized = true;
      console.log('✅ Microsoft Calendar service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Microsoft Calendar service:', error);
    }
  }

  /**
   * Check if a time slot is available in the calendar
   */
  async checkAvailability(startTime: Date, endTime: Date): Promise<boolean> {
    if (!this.initialized || !this.client) {
      console.warn('⚠️ Microsoft Calendar: Service not initialized, assuming available');
      return true; // Default to available if service not configured
    }

    try {
      const calendarId = process.env.SHARED_CALENDAR_ID || 'primary';

      const events = await this.client
        .api(`/me/calendars/${calendarId}/events`)
        .filter(`start/dateTime ge '${startTime.toISOString()}' and end/dateTime le '${endTime.toISOString()}'`)
        .select('id,subject,start,end')
        .get();

      const hasConflicts = events.value && events.value.length > 0;

      if (hasConflicts) {
        console.log(`⚠️ Time slot ${startTime.toISOString()} - ${endTime.toISOString()} is not available`);
        console.log('Conflicting events:', events.value.map((e: any) => e.subject));
      }

      return !hasConflicts;
    } catch (error) {
      console.error('❌ Error checking calendar availability:', error);
      // Return true to not block bookings if calendar check fails
      return true;
    }
  }

  /**
   * Create a calendar event for a consultation booking
   */
  async createEvent(booking: ConsultationBooking): Promise<string | null> {
    if (!this.initialized || !this.client) {
      console.warn('⚠️ Microsoft Calendar: Service not initialized, skipping event creation');
      return null;
    }

    try {
      const calendarId = process.env.SHARED_CALENDAR_ID || 'primary';
      const startTime = this.parseBookingTime(booking.preferredDate, booking.preferredTime);
      const duration = parseInt(process.env.DEFAULT_EVENT_DURATION || '60'); // minutes
      const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));

      const eventData = {
        subject: `Consultation: ${booking.firstName} ${booking.lastName}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: process.env.CALENDAR_TIMEZONE || 'Africa/Harare'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: process.env.CALENDAR_TIMEZONE || 'Africa/Harare'
        },
        location: {
          displayName: this.getLocationName(booking.consultationType)
        },
        body: {
          contentType: 'HTML',
          content: this.generateEventDescription(booking)
        },
        attendees: [{
          emailAddress: {
            address: booking.email,
            name: `${booking.firstName} ${booking.lastName}`
          },
          type: 'required' as const
        }],
        reminders: {
          isReminderOn: true,
          reminderMinutesBeforeStart: parseInt(process.env.CALENDAR_REMINDER_MINUTES || '15')
        },
        categories: ['Consultation', booking.serviceType]
      };

      const response = await this.client
        .api(`/me/calendars/${calendarId}/events`)
        .post(eventData);

      console.log(`✅ Calendar event created: ${response.id} for booking ${booking._id}`);
      return response.id;
    } catch (error) {
      console.error('❌ Error creating calendar event:', error);
      return null;
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, updates: Partial<ConsultationBooking>): Promise<boolean> {
    if (!this.initialized || !this.client) {
      console.warn('⚠️ Microsoft Calendar: Service not initialized, skipping event update');
      return false;
    }

    try {
      const calendarId = process.env.SHARED_CALENDAR_ID || 'primary';
      const updateData: any = {};

      if (updates.preferredDate && updates.preferredTime) {
        const startTime = this.parseBookingTime(updates.preferredDate, updates.preferredTime);
        const duration = parseInt(process.env.DEFAULT_EVENT_DURATION || '60');
        const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));

        updateData.start = {
          dateTime: startTime.toISOString(),
          timeZone: process.env.CALENDAR_TIMEZONE || 'Africa/Harare'
        };
        updateData.end = {
          dateTime: endTime.toISOString(),
          timeZone: process.env.CALENDAR_TIMEZONE || 'Africa/Harare'
        };
      }

      if (updates.firstName || updates.lastName || updates.email) {
        const booking = updates as ConsultationBooking;
        updateData.subject = `Consultation: ${booking.firstName} ${booking.lastName}`;
        updateData.attendees = [{
          emailAddress: {
            address: booking.email,
            name: `${booking.firstName} ${booking.lastName}`
          },
          type: 'required' as const
        }];
      }

      if (Object.keys(updateData).length > 0) {
        await this.client
          .api(`/me/calendars/${calendarId}/events/${eventId}`)
          .patch(updateData);

        console.log(`✅ Calendar event updated: ${eventId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error updating calendar event:', error);
      return false;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.initialized || !this.client) {
      console.warn('⚠️ Microsoft Calendar: Service not initialized, skipping event deletion');
      return false;
    }

    try {
      const calendarId = process.env.SHARED_CALENDAR_ID || 'primary';

      await this.client
        .api(`/me/calendars/${calendarId}/events/${eventId}`)
        .delete();

      console.log(`✅ Calendar event deleted: ${eventId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting calendar event:', error);
      return false;
    }
  }

  /**
   * Get calendar events for a specific date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.initialized || !this.client) {
      console.warn('⚠️ Microsoft Calendar: Service not initialized');
      return [];
    }

    try {
      const calendarId = process.env.SHARED_CALENDAR_ID || 'primary';

      const response = await this.client
        .api(`/me/calendars/${calendarId}/events`)
        .filter(`start/dateTime ge '${startDate.toISOString()}' and start/dateTime le '${endDate.toISOString()}'`)
        .select('id,subject,start,end,location,attendees')
        .orderby('start/dateTime')
        .get();

      return response.value || [];
    } catch (error) {
      console.error('❌ Error fetching calendar events:', error);
      return [];
    }
  }

  /**
   * Parse booking time from date and time slot
   */
  private parseBookingTime(date: string | Date, timeSlot: string): Date {
    const dateObj = new Date(date);

    // Parse time slot (e.g., "morning-9", "afternoon-2")
    const [period, hourStr] = timeSlot.split('-');
    let hour = parseInt(hourStr);

    // Convert to 24-hour format
    if (period === 'afternoon' && hour < 12) {
      hour += 12;
    }

    dateObj.setHours(hour, 0, 0, 0);
    return dateObj;
  }

  /**
   * Get location name based on consultation type
   */
  private getLocationName(consultationType: string): string {
    const locations: Record<string, string> = {
      'in-person': 'IPEACE Office - 135 Baines Avenue, Harare, Zimbabwe',
      'video-call': 'Microsoft Teams Meeting',
      'phone-call': 'Phone Consultation'
    };

    return locations[consultationType] || 'To be confirmed';
  }

  /**
   * Generate HTML description for calendar event
   */
  private generateEventDescription(booking: ConsultationBooking): string {
    const serviceNames: Record<string, string> = {
      regulatory: "Regulatory Compliance",
      ai: "AI-Powered Advisory",
      strategy: "Business Strategy",
      training: "Training & Development",
      documents: "Document Services",
      support: "24/7 Support"
    };

    const consultationNames: Record<string, string> = {
      "in-person": "In-Person Meeting",
      "video-call": "Video Call",
      "phone-call": "Phone Call"
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h3 style="color: #1a365d; margin-bottom: 20px;">Consultation Booking Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px;">Client:</td>
            <td style="padding: 8px 0;">${booking.firstName} ${booking.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;">${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0;">${booking.phone}</td>
          </tr>
          ${booking.company ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Company:</td>
            <td style="padding: 8px 0;">${booking.company}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Service:</td>
            <td style="padding: 8px 0;">${serviceNames[booking.serviceType] || booking.serviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Type:</td>
            <td style="padding: 8px 0;">${consultationNames[booking.consultationType] || booking.consultationType}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0; color: #2d3748;">Description:</h4>
          <p style="margin: 0; color: #4a5568;">${booking.description}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e6fffa; border-radius: 5px;">
          <p style="margin: 0; color: #234e52; font-size: 14px;">
            <strong>Note:</strong> This is an automated calendar event for a consultation booking.
            Please contact the client if you need to reschedule or make changes.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.initialized && !!this.client;
  }
}

// Export singleton instance
export const microsoftCalendar = new MicrosoftCalendarService();