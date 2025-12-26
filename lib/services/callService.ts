/**
 * Call Service
 * 
 * Orchestrates voice calls with AI agents.
 * Connects telephony (Twilio) with voice AI (ElevenLabs).
 * 
 * Flow:
 * 1. Incoming call to a phone number
 * 2. Look up which agent is assigned to that number
 * 3. Get agent's voice configuration
 * 4. Stream audio through ElevenLabs conversational AI
 * 5. Handle call events and transcripts
 */

import { voiceProvider } from "@/lib/providers/voiceProvider";
import { telephonyProvider } from "@/lib/providers/telephonyProvider";

interface CallAgent {
  id: string;
  name: string;
  template: "SALES" | "SUPPORT" | "COLLECTIONS" | "CUSTOM";
  systemPrompt: string;
  language: string;
  voiceId: string;
  voiceName: string;
  tone: string;
  goals: string[];
  enabledTools: string[];
  knowledgeCollectionIds: string[];
}

interface IncomingCallContext {
  callId: string;
  from: string;
  to: string;
  workspaceId: string;
  agent: CallAgent;
}

interface OutboundCallOptions {
  workspaceId: string;
  agentId: string;
  to: string;
  from: string;
  contactId?: string;
  campaignId?: string;
}

interface CallSession {
  id: string;
  callId: string;
  status: "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer";
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  transcript?: string;
  recordingUrl?: string;
}

class CallService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  /**
   * Handle incoming call webhook from telephony provider
   */
  async handleIncomingCall(
    phoneNumber: string,
    callerId: string,
    callSid: string
  ): Promise<{ twiml: string; agentFound: boolean }> {
    // Look up the phone number and its assigned agent
    // In production, this would query the database
    
    // For now, return TwiML that connects to WebSocket for real-time audio
    const websocketUrl = `${this.baseUrl.replace("http", "ws")}/api/calls/stream`;
    
    // Generate TwiML response for real-time streaming
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${websocketUrl}">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="phoneNumber" value="${phoneNumber}" />
      <Parameter name="callerId" value="${callerId}" />
    </Stream>
  </Connect>
</Response>`;

    return { twiml, agentFound: true };
  }

  /**
   * Initialize outbound call with AI agent
   */
  async initiateOutboundCall(options: OutboundCallOptions): Promise<CallSession | null> {
    try {
      // In production:
      // 1. Get agent configuration from database
      // 2. Initiate call via Twilio
      // 3. Connect to ElevenLabs for voice
      
      const callResult = await telephonyProvider.makeCall({
        to: options.to,
        from: options.from,
        agentId: options.agentId,
        workspaceId: options.workspaceId,
        webhookUrl: `${this.baseUrl}/api/webhooks/calls`,
      });

      if (callResult.status === "failed") {
        return null;
      }

      return {
        id: `session_${Date.now()}`,
        callId: callResult.callId,
        status: "ringing",
        startedAt: new Date(),
      };
    } catch (error) {
      console.error("Error initiating outbound call:", error);
      return null;
    }
  }

  /**
   * Generate system prompt for voice AI based on agent config
   */
  generateAgentPrompt(agent: CallAgent, context: { 
    contactName?: string;
    companyName?: string;
    purpose?: string;
  }): string {
    const basePrompt = agent.systemPrompt || this.getDefaultPrompt(agent);
    
    // Add context-specific instructions
    let contextPrompt = "";
    if (context.contactName) {
      contextPrompt += `\nEl cliente se llama ${context.contactName}.`;
    }
    if (context.companyName) {
      contextPrompt += `\nLa empresa del cliente es ${context.companyName}.`;
    }
    if (context.purpose) {
      contextPrompt += `\nPropósito de la llamada: ${context.purpose}.`;
    }

    // Add tool instructions
    let toolsPrompt = "";
    if (agent.enabledTools.includes("scheduleMeeting")) {
      toolsPrompt += `\nPuedes agendar citas usando la función schedule_meeting.`;
    }
    if (agent.enabledTools.includes("createTask")) {
      toolsPrompt += `\nPuedes crear tareas de seguimiento usando la función create_task.`;
    }

    return `${basePrompt}${contextPrompt}${toolsPrompt}`;
  }

  /**
   * Get default system prompt based on agent template
   */
  private getDefaultPrompt(agent: CallAgent): string {
    const prompts: Record<string, string> = {
      SALES: `Eres ${agent.name}, un agente de ventas profesional y amigable. 
Tu objetivo es ayudar a los clientes potenciales a entender nuestros servicios y agendar una cita si están interesados.
Habla de manera ${agent.tone} y mantén la conversación natural.
Responde en ${agent.language.includes("es") ? "español" : agent.language.includes("en") ? "inglés" : "portugués"}.`,
      
      SUPPORT: `Eres ${agent.name}, un agente de soporte técnico experto y paciente.
Tu objetivo es resolver las dudas y problemas de los clientes de manera eficiente.
Siempre confirma que el problema quedó resuelto antes de terminar la llamada.
Responde en ${agent.language.includes("es") ? "español" : agent.language.includes("en") ? "inglés" : "portugués"}.`,
      
      COLLECTIONS: `Eres ${agent.name}, un agente de cobranza profesional pero empático.
Tu objetivo es recordar al cliente sobre pagos pendientes y ayudarle a encontrar una solución.
Mantén un tono ${agent.tone} y nunca seas agresivo.
Responde en ${agent.language.includes("es") ? "español" : agent.language.includes("en") ? "inglés" : "portugués"}.`,
      
      CUSTOM: `Eres ${agent.name}.
${agent.goals.length > 0 ? `Tus objetivos son: ${agent.goals.join(", ")}.` : ""}
Habla de manera ${agent.tone}.
Responde en ${agent.language.includes("es") ? "español" : agent.language.includes("en") ? "inglés" : "portugués"}.`,
    };

    return prompts[agent.template as string] || prompts.CUSTOM;
  }

  /**
   * Get ElevenLabs voice settings for the call
   */
  getVoiceSettings(agent: CallAgent): {
    voiceId: string;
    modelId: string;
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  } {
    // Default voice settings optimized for phone calls
    return {
      voiceId: agent.voiceId,
      modelId: "eleven_turbo_v2", // Low latency model for real-time
      stability: 0.5,
      similarityBoost: 0.75,
      style: agent.tone === "formal" ? 0.2 : agent.tone === "casual" ? 0.8 : 0.5,
      useSpeakerBoost: true,
    };
  }

  /**
   * Handle call status updates
   */
  async handleCallStatusUpdate(
    callSid: string,
    status: string,
    duration?: number
  ): Promise<void> {
    // In production, update CallSession in database
    console.log(`Call ${callSid} status: ${status}, duration: ${duration}s`);
    
    // If call completed, fetch recording and transcript
    if (status === "completed" && duration && duration > 0) {
      const recordingUrl = await telephonyProvider.getCallRecording(callSid);
      const transcript = await telephonyProvider.getCallTranscript(callSid);
      
      // Store in database
      console.log("Recording:", recordingUrl);
      console.log("Transcript:", transcript);
    }
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<boolean> {
    try {
      // In production, use Twilio to end the call
      console.log(`Ending call ${callSid}`);
      return true;
    } catch (error) {
      console.error("Error ending call:", error);
      return false;
    }
  }

  /**
   * Transfer call to a human agent
   */
  async transferToHuman(callSid: string, transferNumber: string): Promise<boolean> {
    try {
      // In production, use Twilio to transfer
      console.log(`Transferring call ${callSid} to ${transferNumber}`);
      return true;
    } catch (error) {
      console.error("Error transferring call:", error);
      return false;
    }
  }
}

export const callService = new CallService();
export type { CallAgent, IncomingCallContext, OutboundCallOptions, CallSession };

