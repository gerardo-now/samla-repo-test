/**
 * Telephony Provider Abstraction
 * 
 * INTERNAL ONLY - Provider name must NEVER appear in UI
 * All phone/PSTN functionality is routed through this abstraction
 * 
 * Uses Twilio internally for:
 * - Phone number management
 * - Outbound calls
 * - Inbound call routing
 * - Call recording
 * - Caller ID verification
 */

import { env } from "@/env.mjs";

interface CallOptions {
  to: string;
  from: string;
  agentId?: string;
  workspaceId: string;
  webhookUrl: string;
}

interface CallResult {
  callId: string;
  status: "initiated" | "failed";
  error?: string;
}

interface PhoneNumberPurchaseOptions {
  country: string;
  areaCode?: string;
  workspaceId: string;
}

interface PhoneNumberResult {
  phoneNumber: string;
  externalId: string;
  country: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
}

interface CallerIdVerificationOptions {
  phoneNumber: string;
  friendlyName?: string;
  workspaceId: string;
}

interface CallerIdVerificationResult {
  validationCode: string;
  externalId: string;
  phoneNumber: string;
}

interface WebhookConfig {
  phoneNumberSid: string;
  voiceUrl: string;
  statusCallbackUrl: string;
}

class TelephonyProvider {
  private accountSid: string;
  private authToken: string;
  private baseUrl: string;

  constructor() {
    this.accountSid = env.TELEPHONY_ACCOUNT_SID || "";
    this.authToken = env.TELEPHONY_AUTH_TOKEN || "";
    this.baseUrl = "https://api.twilio.com/2010-04-01";
  }

  private get isConfigured(): boolean {
    return !!(this.accountSid && this.authToken);
  }

  private getAuthHeader(): string {
    return "Basic " + Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
  }

  /**
   * Make an outbound call
   */
  async makeCall(options: CallOptions): Promise<CallResult> {
    if (!this.isConfigured) {
      console.warn("Telephony not configured - using mock call");
      return {
        callId: `mock_call_${Date.now()}`,
        status: "initiated",
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/Calls.json`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: options.to,
            From: options.from,
            Url: options.webhookUrl,
            StatusCallback: options.webhookUrl,
            StatusCallbackEvent: "initiated ringing answered completed",
            Record: "true",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Twilio call error:", error);
        return {
          callId: "",
          status: "failed",
          error: "Error al iniciar la llamada",
        };
      }

      const data = await response.json();
      return {
        callId: data.sid,
        status: "initiated",
      };
    } catch (error) {
      console.error("Error making call:", error);
      return {
        callId: "",
        status: "failed",
        error: "Error al conectar con el servicio de telefonía",
      };
    }
  }

  /**
   * Purchase a phone number
   */
  async purchasePhoneNumber(
    options: PhoneNumberPurchaseOptions
  ): Promise<PhoneNumberResult | null> {
    if (!this.isConfigured) {
      console.warn("Telephony not configured - using mock number");
      return {
        phoneNumber: `+${options.country === "US" ? "1" : "52"}555${Math.random().toString().slice(2, 9)}`,
        externalId: `PN_mock_${Date.now()}`,
        country: options.country,
        capabilities: { voice: true, sms: false },
      };
    }

    try {
      // First, search for available numbers
      const searchParams = new URLSearchParams({
        VoiceEnabled: "true",
        Country: options.country,
        ...(options.areaCode ? { AreaCode: options.areaCode } : {}),
      });

      const searchResponse = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/AvailablePhoneNumbers/${options.country}/Local.json?${searchParams}`,
        {
          headers: { Authorization: this.getAuthHeader() },
        }
      );

      if (!searchResponse.ok) {
        console.error("Error searching numbers:", await searchResponse.text());
        return null;
      }

      const searchData = await searchResponse.json();
      if (!searchData.available_phone_numbers?.length) {
        console.error("No available numbers found");
        return null;
      }

      const numberToPurchase = searchData.available_phone_numbers[0];

      // Purchase the number
      const purchaseResponse = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/IncomingPhoneNumbers.json`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            PhoneNumber: numberToPurchase.phone_number,
          }),
        }
      );

      if (!purchaseResponse.ok) {
        console.error("Error purchasing number:", await purchaseResponse.text());
        return null;
      }

      const data = await purchaseResponse.json();
      return {
        phoneNumber: data.phone_number,
        externalId: data.sid,
        country: data.country_code,
        capabilities: {
          voice: data.capabilities?.voice ?? true,
          sms: data.capabilities?.sms ?? false,
        },
      };
    } catch (error) {
      console.error("Error purchasing phone number:", error);
      return null;
    }
  }

  /**
   * Start caller ID verification
   */
  async startCallerIdVerification(
    options: CallerIdVerificationOptions
  ): Promise<CallerIdVerificationResult | null> {
    if (!this.isConfigured) {
      console.warn("Telephony not configured - using mock verification");
      return {
        validationCode: "123456",
        externalId: `CV_mock_${Date.now()}`,
        phoneNumber: options.phoneNumber,
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/OutgoingCallerIds.json`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            PhoneNumber: options.phoneNumber,
            FriendlyName: options.friendlyName || options.phoneNumber,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Caller ID verification error:", error);
        return null;
      }

      const data = await response.json();
      return {
        validationCode: data.validation_code,
        externalId: data.call_sid,
        phoneNumber: options.phoneNumber,
      };
    } catch (error) {
      console.error("Error starting caller ID verification:", error);
      return null;
    }
  }

  /**
   * Configure webhook for a phone number
   */
  async configureWebhook(config: WebhookConfig): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn("Telephony not configured - skipping webhook config");
      return true;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/IncomingPhoneNumbers/${config.phoneNumberSid}.json`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            VoiceUrl: config.voiceUrl,
            VoiceMethod: "POST",
            StatusCallback: config.statusCallbackUrl,
            StatusCallbackMethod: "POST",
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error configuring webhook:", error);
      return false;
    }
  }

  /**
   * Get call recording URL
   */
  async getCallRecording(callSid: string): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/Calls/${callSid}/Recordings.json`,
        {
          headers: { Authorization: this.getAuthHeader() },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.recordings?.length) return null;

      const recordingSid = data.recordings[0].sid;
      return `https://api.twilio.com${data.recordings[0].uri.replace(".json", ".mp3")}`;
    } catch (error) {
      console.error("Error getting call recording:", error);
      return null;
    }
  }

  /**
   * Get call transcript (from recording)
   */
  async getCallTranscript(callSid: string): Promise<string | null> {
    // Twilio doesn't provide built-in transcription
    // This would need to be done via a speech-to-text service
    // For now, return null
    return null;
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<boolean> {
    if (!this.isConfigured) {
      return true;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/Accounts/${this.accountSid}/Calls/${callSid}.json`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            Status: "completed",
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error ending call:", error);
      return false;
    }
  }

  /**
   * Validate webhook signature for security
   */
  validateWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>
  ): boolean {
    // In production, implement Twilio signature validation
    // using crypto.createHmac('sha1', authToken)
    if (!this.isConfigured) {
      return true; // Skip validation in mock mode
    }

    // TODO: Implement proper validation
    // const crypto = require('crypto');
    // const data = url + Object.keys(params).sort().map(key => key + params[key]).join('');
    // const expectedSignature = crypto.createHmac('sha1', this.authToken).update(data).digest('base64');
    // return signature === expectedSignature;

    return true;
  }
}

export const telephonyProvider = new TelephonyProvider();
export type {
  CallOptions,
  CallResult,
  PhoneNumberPurchaseOptions,
  PhoneNumberResult,
  CallerIdVerificationOptions,
  CallerIdVerificationResult,
  WebhookConfig,
};
