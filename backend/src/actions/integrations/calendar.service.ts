import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

export interface CalendarEvent {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
}

export interface AvailableSlot {
  start: Date;
  end: Date;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Initialize Google Calendar OAuth2 client
   */
  private getGoogleAuth(credentials: any) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        credentials.client_id || this.configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
        credentials.client_secret || this.configService.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
        credentials.redirect_uri || this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI'),
      );

      if (credentials.access_token) {
        oauth2Client.setCredentials({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
        });
      }

      return oauth2Client;
    } catch (error) {
      this.logger.error('Failed to initialize Google Auth:', error);
      throw new Error('Calendar authentication failed');
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(
    credentials: any,
    calendarId: string,
    event: CalendarEvent,
  ): Promise<{ success: boolean; eventId?: string; eventLink?: string; error?: string }> {
    try {
      const auth = this.getGoogleAuth(credentials);
      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'UTC',
          },
          attendees: event.attendees?.map((email) => ({ email })),
          location: event.location,
          conferenceData: {
            createRequest: {
              requestId: `agentdesk-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      const eventData = response.data;
      this.logger.log(`Calendar event created: ${eventData.id}`);

      return {
        success: true,
        eventId: eventData.id,
        eventLink: eventData.htmlLink,
      };
    } catch (error) {
      this.logger.error('Failed to create calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find available time slots
   */
  async findAvailableSlots(
    credentials: any,
    calendarId: string,
    startDate: Date,
    endDate: Date,
    durationMinutes: number,
    availableHours: Record<string, string[]>, // e.g., { "monday": ["09:00-17:00"] }
    bufferMinutes: number = 15,
  ): Promise<AvailableSlot[]> {
    try {
      const auth = this.getGoogleAuth(credentials);
      const calendar = google.calendar({ version: 'v3', auth });

      // Get busy times from calendar
      const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: calendarId }],
        },
      });

      const busySlots = freeBusyResponse.data.calendars?.[calendarId]?.busy || [];

      // Generate potential slots based on available hours
      const availableSlots: AvailableSlot[] = [];
      const currentDate = new Date(startDate);

      while (currentDate < endDate) {
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayHours = availableHours[dayName];

        if (dayHours) {
          for (const hourRange of dayHours) {
            const [startTime, endTime] = hourRange.split('-');
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            const slotStart = new Date(currentDate);
            slotStart.setHours(startHour, startMin, 0, 0);

            const slotEnd = new Date(currentDate);
            slotEnd.setHours(endHour, endMin, 0, 0);

            // Generate slots within the available hours
            let checkTime = new Date(slotStart);
            while (checkTime.getTime() + durationMinutes * 60000 <= slotEnd.getTime()) {
              const slotEndTime = new Date(checkTime.getTime() + durationMinutes * 60000);

              // Check if slot overlaps with busy times
              const isAvailable = !busySlots.some((busy) => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return (
                  (checkTime >= busyStart && checkTime < busyEnd) ||
                  (slotEndTime > busyStart && slotEndTime <= busyEnd) ||
                  (checkTime <= busyStart && slotEndTime >= busyEnd)
                );
              });

              if (isAvailable && checkTime > new Date()) {
                availableSlots.push({
                  start: new Date(checkTime),
                  end: new Date(slotEndTime),
                });
              }

              // Move to next slot (with buffer)
              checkTime = new Date(checkTime.getTime() + (durationMinutes + bufferMinutes) * 60000);
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return availableSlots;
    } catch (error) {
      this.logger.error('Failed to find available slots:', error);
      return [];
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(
    credentials: any,
    calendarId: string,
    eventId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const auth = this.getGoogleAuth(credentials);
      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      this.logger.log(`Calendar event deleted: ${eventId}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl(clientId?: string, redirectUri?: string): string {
    const oauth2Client = new google.auth.OAuth2(
      clientId || this.configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
      this.configService.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
      redirectUri || this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI'),
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string, redirectUri?: string): Promise<any> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
        this.configService.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
        redirectUri || this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI'),
      );

      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens:', error);
      throw error;
    }
  }
}

