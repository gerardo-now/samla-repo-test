/**
 * Calendar Provider Abstraction
 * 
 * INTERNAL ONLY - Provider names must NEVER appear in UI
 * Supports Google Calendar and Outlook Calendar through unified interface
 */

export type CalendarProviderType = 'google' | 'outlook';

export interface CalendarCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface CalendarEvent {
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
  attendeePhone?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface AvailabilityOptions {
  calendarId: string;
  startDate: Date;
  endDate: Date;
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string;   // "18:00"
  workingDays: number[];     // [1,2,3,4,5] = Mon-Fri
  slotDuration: number;      // minutes
  bufferTime: number;        // minutes between slots
  timezone: string;
}

export interface CalendarListItem {
  id: string;
  name: string;
  primary: boolean;
  color?: string;
  accessRole?: string;
}

export interface BusyTime {
  start: Date;
  end: Date;
}

// OAuth configuration
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

// ============================================================================
// GOOGLE CALENDAR PROVIDER
// ============================================================================

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_OAUTH_API = 'https://oauth2.googleapis.com';

export class GoogleCalendarProvider {
  private credentials: CalendarCredentials;
  private oauthConfig?: OAuthConfig;

  constructor(credentials: CalendarCredentials, oauthConfig?: OAuthConfig) {
    this.credentials = credentials;
    this.oauthConfig = oauthConfig;
  }

  /**
   * Generate OAuth authorization URL
   */
  static getAuthUrl(config: OAuthConfig, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCode(code: string, config: OAuthConfig): Promise<CalendarCredentials | null> {
    try {
      const response = await fetch(`${GOOGLE_OAUTH_API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        console.error('Token exchange failed:', await response.text());
        return null;
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch (error) {
      console.error('Error exchanging code:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<CalendarCredentials | null> {
    if (!this.credentials.refreshToken || !this.oauthConfig) {
      return null;
    }

    try {
      const response = await fetch(`${GOOGLE_OAUTH_API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: this.credentials.refreshToken,
          client_id: this.oauthConfig.clientId,
          client_secret: this.oauthConfig.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      this.credentials = {
        ...this.credentials,
        accessToken: data.access_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
      return this.credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    // Check if token needs refresh
    if (this.credentials.tokenExpiresAt && new Date() >= this.credentials.tokenExpiresAt) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`${GOOGLE_CALENDAR_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendar API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get user email from token
   */
  async getUserEmail(): Promise<string | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${this.credentials.accessToken}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.email;
    } catch {
      return null;
    }
  }

  /**
   * Get list of user's calendars
   */
  async getCalendarList(): Promise<CalendarListItem[]> {
    try {
      const data = await this.apiRequest('/users/me/calendarList');
      return data.items?.map((cal: any) => ({
        id: cal.id,
        name: cal.summary,
        primary: cal.primary || false,
        color: cal.backgroundColor,
        accessRole: cal.accessRole,
      })) || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      return [];
    }
  }

  /**
   * Get busy times from calendar
   */
  async getBusyTimes(calendarId: string, startTime: Date, endTime: Date): Promise<BusyTime[]> {
    try {
      const data = await this.apiRequest('/freeBusy', {
        method: 'POST',
        body: JSON.stringify({
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: calendarId }],
        }),
      });

      const busy = data.calendars?.[calendarId]?.busy || [];
      return busy.map((b: any) => ({
        start: new Date(b.start),
        end: new Date(b.end),
      }));
    } catch (error) {
      console.error('Error fetching busy times:', error);
      return [];
    }
  }

  /**
   * Get available time slots
   */
  async getAvailableSlots(options: AvailabilityOptions): Promise<TimeSlot[]> {
    const busyTimes = await this.getBusyTimes(options.calendarId, options.startDate, options.endDate);
    return calculateAvailableSlots(options, busyTimes);
  }

  /**
   * Get events from calendar
   */
  async getEvents(calendarId: string, startTime: Date, endTime: Date, timezone: string = 'America/Mexico_City'): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const data = await this.apiRequest(`/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
      
      return data.items?.map((event: any) => ({
        externalId: event.id,
        title: event.summary || 'Sin título',
        description: event.description,
        startTime: new Date(event.start?.dateTime || event.start?.date),
        endTime: new Date(event.end?.dateTime || event.end?.date),
        timezone: event.start?.timeZone || timezone,
        location: event.location,
        attendeeEmail: event.attendees?.[0]?.email,
        attendeeName: event.attendees?.[0]?.displayName,
        status: event.status === 'cancelled' ? 'cancelled' : 'confirmed',
      })) || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  /**
   * Create a new event
   */
  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent | null> {
    try {
      const eventData: any = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone,
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone,
        },
        location: event.location,
      };

      if (event.attendeeEmail) {
        eventData.attendees = [{
          email: event.attendeeEmail,
          displayName: event.attendeeName,
        }];
      }

      const data = await this.apiRequest(`/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      return {
        ...event,
        externalId: data.id,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(calendarId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const eventData: any = {};
      if (updates.title) eventData.summary = updates.title;
      if (updates.description) eventData.description = updates.description;
      if (updates.startTime) {
        eventData.start = {
          dateTime: updates.startTime.toISOString(),
          timeZone: updates.timezone,
        };
      }
      if (updates.endTime) {
        eventData.end = {
          dateTime: updates.endTime.toISOString(),
          timeZone: updates.timezone,
        };
      }
      if (updates.location) eventData.location = updates.location;

      const data = await this.apiRequest(
        `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(eventData),
        }
      );

      return {
        externalId: data.id,
        title: data.summary,
        startTime: new Date(data.start?.dateTime),
        endTime: new Date(data.end?.dateTime),
        timezone: data.start?.timeZone,
        ...updates,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }

  /**
   * Cancel/delete an event
   */
  async cancelEvent(calendarId: string, eventId: string): Promise<boolean> {
    try {
      await this.apiRequest(
        `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        { method: 'DELETE' }
      );
      return true;
    } catch (error) {
      console.error('Error canceling event:', error);
      return false;
    }
  }
}

// ============================================================================
// OUTLOOK CALENDAR PROVIDER
// ============================================================================

const MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0';
const MICROSOFT_OAUTH_API = 'https://login.microsoftonline.com/common/oauth2/v2.0';

export class OutlookCalendarProvider {
  private credentials: CalendarCredentials;
  private oauthConfig?: OAuthConfig;

  constructor(credentials: CalendarCredentials, oauthConfig?: OAuthConfig) {
    this.credentials = credentials;
    this.oauthConfig = oauthConfig;
  }

  /**
   * Generate OAuth authorization URL
   */
  static getAuthUrl(config: OAuthConfig, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: [
        'offline_access',
        'User.Read',
        'Calendars.ReadWrite',
      ].join(' '),
      ...(state && { state }),
    });
    return `${MICROSOFT_OAUTH_API}/authorize?${params}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeCode(code: string, config: OAuthConfig): Promise<CalendarCredentials | null> {
    try {
      const response = await fetch(`${MICROSOFT_OAUTH_API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch (error) {
      console.error('Error exchanging code:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<CalendarCredentials | null> {
    if (!this.credentials.refreshToken || !this.oauthConfig) return null;

    try {
      const response = await fetch(`${MICROSOFT_OAUTH_API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: this.credentials.refreshToken,
          client_id: this.oauthConfig.clientId,
          client_secret: this.oauthConfig.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      this.credentials = {
        ...this.credentials,
        accessToken: data.access_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
      return this.credentials;
    } catch (error) {
      return null;
    }
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    if (this.credentials.tokenExpiresAt && new Date() >= this.credentials.tokenExpiresAt) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`${MICROSOFT_GRAPH_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Graph API error: ${await response.text()}`);
    }

    return response.json();
  }

  async getUserEmail(): Promise<string | null> {
    try {
      const data = await this.apiRequest('/me');
      return data.mail || data.userPrincipalName;
    } catch {
      return null;
    }
  }

  async getCalendarList(): Promise<CalendarListItem[]> {
    try {
      const data = await this.apiRequest('/me/calendars');
      return data.value?.map((cal: any) => ({
        id: cal.id,
        name: cal.name,
        primary: cal.isDefaultCalendar || false,
        color: cal.hexColor,
      })) || [];
    } catch {
      return [];
    }
  }

  async getBusyTimes(calendarId: string, startTime: Date, endTime: Date): Promise<BusyTime[]> {
    try {
      const data = await this.apiRequest(`/me/calendars/${calendarId}/calendarView?startDateTime=${startTime.toISOString()}&endDateTime=${endTime.toISOString()}&$select=start,end,showAs`);
      
      return data.value
        ?.filter((event: any) => event.showAs === 'busy' || event.showAs === 'tentative')
        .map((event: any) => ({
          start: new Date(event.start.dateTime + 'Z'),
          end: new Date(event.end.dateTime + 'Z'),
        })) || [];
    } catch {
      return [];
    }
  }

  async getAvailableSlots(options: AvailabilityOptions): Promise<TimeSlot[]> {
    const busyTimes = await this.getBusyTimes(options.calendarId, options.startDate, options.endDate);
    return calculateAvailableSlots(options, busyTimes);
  }

  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent | null> {
    try {
      const eventData: any = {
        subject: event.title,
        body: { contentType: 'text', content: event.description || '' },
        start: { dateTime: event.startTime.toISOString(), timeZone: event.timezone },
        end: { dateTime: event.endTime.toISOString(), timeZone: event.timezone },
        location: event.location ? { displayName: event.location } : undefined,
      };

      if (event.attendeeEmail) {
        eventData.attendees = [{
          emailAddress: { address: event.attendeeEmail, name: event.attendeeName },
          type: 'required',
        }];
      }

      const data = await this.apiRequest(`/me/calendars/${calendarId}/events`, {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      return { ...event, externalId: data.id };
    } catch {
      return null;
    }
  }

  async updateEvent(calendarId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const eventData: any = {};
      if (updates.title) eventData.subject = updates.title;
      if (updates.description) eventData.body = { contentType: 'text', content: updates.description };
      if (updates.startTime) eventData.start = { dateTime: updates.startTime.toISOString(), timeZone: updates.timezone };
      if (updates.endTime) eventData.end = { dateTime: updates.endTime.toISOString(), timeZone: updates.timezone };
      if (updates.location) eventData.location = { displayName: updates.location };

      await this.apiRequest(`/me/calendars/${calendarId}/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify(eventData),
      });

      return { ...updates } as CalendarEvent;
    } catch {
      return null;
    }
  }

  async cancelEvent(calendarId: string, eventId: string): Promise<boolean> {
    try {
      await this.apiRequest(`/me/calendars/${calendarId}/events/${eventId}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate available time slots based on working hours and busy times
 */
function calculateAvailableSlots(options: AvailabilityOptions, busyTimes: BusyTime[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const current = new Date(options.startDate);
  const end = new Date(options.endDate);

  while (current < end) {
    const dayOfWeek = current.getDay();
    
    // Check if this is a working day (0 = Sunday, 1 = Monday, etc.)
    if (options.workingDays.includes(dayOfWeek)) {
      const [startHour, startMin] = options.workingHoursStart.split(':').map(Number);
      const [endHour, endMin] = options.workingHoursEnd.split(':').map(Number);

      const dayStart = new Date(current);
      dayStart.setHours(startHour, startMin, 0, 0);

      const dayEnd = new Date(current);
      dayEnd.setHours(endHour, endMin, 0, 0);

      let slotStart = new Date(dayStart);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + options.slotDuration * 60 * 1000);
        
        if (slotEnd > dayEnd) break;

        // Check if slot overlaps with any busy time
        const isAvailable = !busyTimes.some(busy => {
          const bufferStart = new Date(busy.start.getTime() - options.bufferTime * 60 * 1000);
          const bufferEnd = new Date(busy.end.getTime() + options.bufferTime * 60 * 1000);
          return slotStart < bufferEnd && slotEnd > bufferStart;
        });

        // Only add future slots
        if (slotStart > new Date()) {
          slots.push({
            start: new Date(slotStart),
            end: new Date(slotEnd),
            available: isAvailable,
          });
        }

        slotStart = new Date(slotEnd.getTime() + options.bufferTime * 60 * 1000);
      }
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return slots.filter(s => s.available);
}

/**
 * Create calendar provider based on type
 */
export function createCalendarProvider(
  provider: CalendarProviderType,
  credentials: CalendarCredentials,
  oauthConfig?: OAuthConfig
): GoogleCalendarProvider | OutlookCalendarProvider {
  switch (provider) {
    case 'google':
      return new GoogleCalendarProvider(credentials, oauthConfig);
    case 'outlook':
      return new OutlookCalendarProvider(credentials, oauthConfig);
    default:
      throw new Error('Proveedor de calendario no soportado');
  }
}
