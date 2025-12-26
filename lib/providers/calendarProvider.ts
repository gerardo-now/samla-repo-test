/**
 * Calendar Provider Abstraction
 * 
 * INTERNAL ONLY - Provider names must NEVER appear in UI
 * Supports Google Calendar and Outlook Calendar through unified interface
 */

type CalendarProviderType = 'google' | 'outlook';

interface CalendarCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

interface TimeSlot {
  start: Date;
  end: Date;
}

interface CalendarEvent {
  id?: string;
  externalId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  location?: string;
  attendeeEmail?: string;
  attendeeName?: string;
}

interface AvailabilityOptions {
  calendarId: string;
  startDate: Date;
  endDate: Date;
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string;   // "18:00"
  workingDays: number[];     // [1,2,3,4,5] = Mon-Fri
  slotDuration: number;      // minutes
  bufferTime: number;        // minutes between slots
}

interface CalendarList {
  id: string;
  name: string;
  primary: boolean;
}

abstract class BaseCalendarProvider {
  protected provider: CalendarProviderType;
  protected credentials: CalendarCredentials;

  constructor(provider: CalendarProviderType, credentials: CalendarCredentials) {
    this.provider = provider;
    this.credentials = credentials;
  }

  abstract getCalendarList(): Promise<CalendarList[]>;
  abstract getAvailableSlots(options: AvailabilityOptions): Promise<TimeSlot[]>;
  abstract createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent | null>;
  abstract updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
  abstract cancelEvent(calendarId: string, eventId: string): Promise<boolean>;
  abstract refreshToken(): Promise<CalendarCredentials | null>;
}

class GoogleCalendarProvider extends BaseCalendarProvider {
  constructor(credentials: CalendarCredentials) {
    super('google', credentials);
  }

  async getCalendarList(): Promise<CalendarList[]> {
    // Implementation would use Google Calendar API
    try {
      return [
        { id: 'primary', name: 'Calendario principal', primary: true },
      ];
    } catch (error) {
      return [];
    }
  }

  async getAvailableSlots(options: AvailabilityOptions): Promise<TimeSlot[]> {
    // Implementation would fetch busy times and calculate available slots
    try {
      return [];
    } catch (error) {
      return [];
    }
  }

  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent | null> {
    // Implementation would create event via Google Calendar API
    try {
      return {
        ...event,
        externalId: 'gcal_' + Date.now(),
      };
    } catch (error) {
      return null;
    }
  }

  async updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      return null;
    } catch (error) {
      return null;
    }
  }

  async cancelEvent(calendarId: string, eventId: string): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<CalendarCredentials | null> {
    try {
      return this.credentials;
    } catch (error) {
      return null;
    }
  }
}

class OutlookCalendarProvider extends BaseCalendarProvider {
  constructor(credentials: CalendarCredentials) {
    super('outlook', credentials);
  }

  async getCalendarList(): Promise<CalendarList[]> {
    // Implementation would use Microsoft Graph API
    try {
      return [
        { id: 'calendar', name: 'Calendario', primary: true },
      ];
    } catch (error) {
      return [];
    }
  }

  async getAvailableSlots(options: AvailabilityOptions): Promise<TimeSlot[]> {
    try {
      return [];
    } catch (error) {
      return [];
    }
  }

  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent | null> {
    try {
      return {
        ...event,
        externalId: 'outlook_' + Date.now(),
      };
    } catch (error) {
      return null;
    }
  }

  async updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      return null;
    } catch (error) {
      return null;
    }
  }

  async cancelEvent(calendarId: string, eventId: string): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<CalendarCredentials | null> {
    try {
      return this.credentials;
    } catch (error) {
      return null;
    }
  }
}

export function createCalendarProvider(
  provider: CalendarProviderType,
  credentials: CalendarCredentials
): BaseCalendarProvider {
  switch (provider) {
    case 'google':
      return new GoogleCalendarProvider(credentials);
    case 'outlook':
      return new OutlookCalendarProvider(credentials);
    default:
      throw new Error('Proveedor de calendario no soportado');
  }
}

export type { CalendarProviderType, CalendarCredentials, TimeSlot, CalendarEvent, AvailabilityOptions, CalendarList };

