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
  status: "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer" | "transferred";
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  transcript?: string;
  recordingUrl?: string;
  transferredTo?: string;
  transferType?: "human" | "agent";
}

interface TransferConfig {
  enabled: boolean;
  type: "phone" | "agent" | "queue";
  destination?: string;
  destinationName?: string;
  conditions?: string[];
  message?: string;
}

interface AgentTransferConfig {
  transferToHuman?: TransferConfig;
  transferToAgent?: TransferConfig;
  fallbackMessage?: string;
  maxTransferAttempts?: number;
  escalationKeywords?: string[];
  autoEscalateOnFrustration?: boolean;
  autoEscalateOnRequest?: boolean;
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
      // Use Twilio API to end the call
      await telephonyProvider.endCall(callSid);
      console.log(`Ended call ${callSid}`);
      return true;
    } catch (error) {
      console.error("Error ending call:", error);
      return false;
    }
  }

  /**
   * Transfer call to a human agent
   * Uses Twilio's <Dial> verb to connect to a human
   */
  async transferToHuman(
    callSid: string, 
    transferNumber: string,
    options?: {
      announceMessage?: string;
      callerId?: string;
      timeout?: number;
      record?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Transferring call ${callSid} to human at ${transferNumber}`);
      
      // Generate TwiML for warm transfer with announcement
      const twiml = this.generateTransferTwiml(transferNumber, {
        type: "human",
        announceMessage: options?.announceMessage || "Conectando con un asesor. Por favor espere.",
        callerId: options?.callerId,
        timeout: options?.timeout || 30,
        record: options?.record ?? true,
      });

      // Update the active call with new TwiML
      await telephonyProvider.updateCall(callSid, { twiml });

      return { success: true };
    } catch (error) {
      console.error("Error transferring call to human:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error al transferir"
      };
    }
  }

  /**
   * Transfer call to another AI agent
   * Seamlessly switches to a different agent (e.g., sales to support)
   */
  async transferToAgent(
    callSid: string,
    targetAgentId: string,
    options?: {
      announceMessage?: string;
      context?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Transferring call ${callSid} to agent ${targetAgentId}`);

      // In production, this would:
      // 1. Fetch the target agent's configuration
      // 2. Switch the ElevenLabs conversation to use the new agent's voice/prompt
      // 3. Optionally play a transition message

      const twiml = this.generateAgentSwitchTwiml(targetAgentId, {
        announceMessage: options?.announceMessage || "Transfiriendo a un especialista.",
        context: options?.context,
      });

      await telephonyProvider.updateCall(callSid, { twiml });

      return { success: true };
    } catch (error) {
      console.error("Error transferring to agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error al transferir"
      };
    }
  }

  /**
   * Perform warm transfer (announce to human, then connect caller)
   */
  async warmTransfer(
    callSid: string,
    transferNumber: string,
    options: {
      whisperToAgent?: string;
      callerHoldMusic?: string;
      timeout?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Initiating warm transfer for call ${callSid}`);

      // Warm transfer: Call the human first, announce, then bridge
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">Un momento, transfiriendo su llamada.</Say>
  <Enqueue waitUrl="/api/calls/hold-music">transfer-queue-${callSid}</Enqueue>
  <Dial action="${this.baseUrl}/api/calls/transfer-complete" timeout="${options.timeout || 30}" record="record-from-answer">
    <Number url="${this.baseUrl}/api/calls/whisper?message=${encodeURIComponent(options.whisperToAgent || "Llamada entrante de cliente")}">${transferNumber}</Number>
  </Dial>
</Response>`;

      await telephonyProvider.updateCall(callSid, { twiml });

      return { success: true };
    } catch (error) {
      console.error("Error in warm transfer:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error en transferencia" 
      };
    }
  }

  /**
   * Check if transfer should be triggered based on conversation context
   */
  shouldTransfer(
    config: AgentTransferConfig,
    context: {
      userMessage: string;
      sentiment?: "positive" | "neutral" | "negative" | "frustrated";
      requestsHuman?: boolean;
      conversationTurns?: number;
      topics?: string[];
    }
  ): { shouldTransfer: boolean; type?: "human" | "agent"; reason?: string } {
    // Check if transfer to human is enabled
    if (config.transferToHuman?.enabled) {
      // Check escalation keywords
      const keywords = config.escalationKeywords || [
        "hablar con humano",
        "persona real",
        "asesor",
        "representante",
        "gerente",
        "supervisor",
        "queja",
        "cancelar",
      ];

      const messageLower = context.userMessage.toLowerCase();
      const matchedKeyword = keywords.find((kw) => messageLower.includes(kw.toLowerCase()));
      
      if (matchedKeyword) {
        return { 
          shouldTransfer: true, 
          type: "human", 
          reason: `Palabra clave detectada: ${matchedKeyword}` 
        };
      }

      // Check frustration
      if (config.autoEscalateOnFrustration && context.sentiment === "frustrated") {
        return { 
          shouldTransfer: true, 
          type: "human", 
          reason: "Cliente frustrado" 
        };
      }

      // Check explicit request
      if (config.autoEscalateOnRequest && context.requestsHuman) {
        return { 
          shouldTransfer: true, 
          type: "human", 
          reason: "Cliente solicitó hablar con humano" 
        };
      }
    }

    // Check transfer to agent conditions
    if (config.transferToAgent?.enabled && config.transferToAgent.conditions) {
      // Example: Transfer to support agent if topic is "technical_issue"
      if (
        config.transferToAgent.conditions.includes("complex") &&
        context.topics?.includes("technical_issue")
      ) {
        return { 
          shouldTransfer: true, 
          type: "agent", 
          reason: "Tema técnico complejo" 
        };
      }
    }

    return { shouldTransfer: false };
  }

  /**
   * Generate TwiML for human transfer
   */
  private generateTransferTwiml(
    phoneNumber: string,
    options: {
      type: "human" | "queue";
      announceMessage?: string;
      callerId?: string;
      timeout?: number;
      record?: boolean;
    }
  ): string {
    const recordAttr = options.record ? 'record="record-from-answer"' : '';
    const callerIdAttr = options.callerId ? `callerId="${options.callerId}"` : '';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">${options.announceMessage || "Conectando con un asesor."}</Say>
  <Dial action="${this.baseUrl}/api/calls/transfer-status" timeout="${options.timeout || 30}" ${recordAttr} ${callerIdAttr}>
    <Number>${phoneNumber}</Number>
  </Dial>
  <Say language="es-MX">No fue posible conectar. Por favor intente más tarde.</Say>
  <Hangup />
</Response>`;
  }

  /**
   * Generate TwiML for switching to another AI agent
   */
  private generateAgentSwitchTwiml(
    agentId: string,
    options: {
      announceMessage?: string;
      context?: Record<string, unknown>;
    }
  ): string {
    const websocketUrl = `${this.baseUrl.replace("http", "ws")}/api/calls/stream`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">${options.announceMessage || "Un momento, transfiriendo."}</Say>
  <Pause length="1"/>
  <Connect>
    <Stream url="${websocketUrl}">
      <Parameter name="agentId" value="${agentId}" />
      <Parameter name="transferContext" value="${encodeURIComponent(JSON.stringify(options.context || {}))}" />
    </Stream>
  </Connect>
</Response>`;
  }

  /**
   * Handle transfer result and fallback
   */
  async handleTransferResult(
    callSid: string,
    success: boolean,
    config: AgentTransferConfig
  ): Promise<void> {
    if (!success && config.fallbackMessage) {
      // Play fallback message and return to AI
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">${config.fallbackMessage}</Say>
  <Connect>
    <Stream url="${this.baseUrl.replace("http", "ws")}/api/calls/stream">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="resumeFromTransfer" value="true" />
    </Stream>
  </Connect>
</Response>`;

      await telephonyProvider.updateCall(callSid, { twiml });
    }
  }
}

export const callService = new CallService();
export type { CallAgent, IncomingCallContext, OutboundCallOptions, CallSession };

