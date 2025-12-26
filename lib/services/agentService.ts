/**
 * Agent Service
 * 
 * Unified AI agent that handles conversations from any channel (WhatsApp, Phone).
 * Integrates with calendar for booking, knowledge base for answers,
 * and AI analysis for escalation detection.
 */

import { analyzeConversation, checkMessageForEscalation, type ConversationAnalysis } from "./aiAnalysisService";

// Types
interface CalendarSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface BookingRequest {
  title: string;
  startTime: Date;
  endTime: Date;
  attendeeName?: string;
  attendeePhone?: string;
  attendeeEmail?: string;
  contactId?: string;
}

interface AgentContext {
  workspaceId: string;
  agentId: string;
  channelType: "WHATSAPP" | "PHONE";
  contactPhone?: string;
  contactName?: string;
  conversationId?: string;
  language?: string;
}

interface AgentResponse {
  message: string;
  action?: "book_appointment" | "transfer_to_human" | "send_info" | "follow_up";
  bookingData?: BookingRequest;
  analysis?: ConversationAnalysis;
  shouldEscalate?: boolean;
  escalationReason?: string;
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// System prompts for different agent templates
const SYSTEM_PROMPTS = {
  SALES: `Eres un asistente de ventas profesional y amable. Tu objetivo es:
1. Entender las necesidades del cliente
2. Presentar los productos/servicios de forma clara
3. Agendar citas cuando el cliente esté interesado
4. Responder dudas sobre precios y disponibilidad

Siempre sé cortés y no presiones al cliente. Si no sabes algo, ofrece transferir a un humano.`,

  SUPPORT: `Eres un asistente de soporte técnico paciente y servicial. Tu objetivo es:
1. Entender el problema del cliente
2. Ofrecer soluciones paso a paso
3. Escalar a un humano si el problema es complejo
4. Hacer seguimiento de tickets abiertos

Siempre muestra empatía y asegúrate de que el cliente se sienta escuchado.`,

  COLLECTIONS: `Eres un asistente de cobranza respetuoso y profesional. Tu objetivo es:
1. Recordar al cliente sobre pagos pendientes
2. Ofrecer opciones de pago flexibles
3. Agendar llamadas de seguimiento
4. Registrar compromisos de pago

Nunca seas agresivo. Mantén un tono profesional y empático.`,

  CUSTOM: `Eres un asistente virtual profesional. Ayuda al cliente con sus consultas de manera clara y eficiente.`,
};

// Booking-related phrases for detection
const BOOKING_INTENT_PHRASES = [
  "agendar", "cita", "reservar", "disponibilidad", "horario",
  "cuándo pueden", "hay espacio", "quiero ir", "me gustaría ir",
  "appointment", "schedule", "book", "available", "when can",
];

const HUMAN_REQUEST_PHRASES = [
  "hablar con alguien", "una persona", "humano", "agente", "asesor",
  "gerente", "supervisor", "no me entiende", "persona real",
  "talk to someone", "human", "real person", "agent", "manager",
];

class AgentService {
  private appUrl: string;

  constructor() {
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  /**
   * Process a message and generate agent response
   */
  async processMessage(
    context: AgentContext,
    userMessage: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<AgentResponse> {
    const lowerMessage = userMessage.toLowerCase();

    // Check for escalation triggers first
    const escalationCheck = checkMessageForEscalation(userMessage);
    if (escalationCheck.shouldEscalate) {
      return this.generateEscalationResponse(escalationCheck.reason);
    }

    // Check for explicit human request
    if (HUMAN_REQUEST_PHRASES.some(phrase => lowerMessage.includes(phrase))) {
      return this.generateEscalationResponse("EXPLICIT_REQUEST");
    }

    // Check for booking intent
    if (BOOKING_INTENT_PHRASES.some(phrase => lowerMessage.includes(phrase))) {
      return this.handleBookingIntent(context, userMessage, conversationHistory);
    }

    // Analyze conversation for labels and sentiment
    const messages = [
      ...conversationHistory.map(m => ({
        content: m.content,
        direction: m.role === "user" ? "INBOUND" as const : "OUTBOUND" as const,
      })),
      { content: userMessage, direction: "INBOUND" as const },
    ];
    const analysis = analyzeConversation(messages);

    // Generate response based on intent
    const response = await this.generateResponse(context, userMessage, conversationHistory, analysis);

    return {
      ...response,
      analysis,
      shouldEscalate: analysis.needsEscalation,
      escalationReason: analysis.escalationReason,
    };
  }

  /**
   * Handle booking/appointment intent
   */
  private async handleBookingIntent(
    context: AgentContext,
    userMessage: string,
    history: ConversationMessage[]
  ): Promise<AgentResponse> {
    try {
      // Get available slots
      const slots = await this.getAvailableSlots(context.workspaceId);

      if (slots.length === 0) {
        return {
          message: "Disculpa, no tengo disponibilidad visible en este momento. ¿Te gustaría que te contacte un asesor para buscar opciones?",
          action: "transfer_to_human",
          shouldEscalate: true,
          escalationReason: "No hay slots disponibles",
        };
      }

      // Format available slots for the user
      const formattedSlots = slots.slice(0, 5).map((slot, i) => {
        const date = new Date(slot.start);
        const options: Intl.DateTimeFormatOptions = {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
        return `${i + 1}. ${date.toLocaleDateString("es-MX", options)}`;
      }).join("\n");

      return {
        message: `¡Perfecto! Estos son los horarios disponibles:\n\n${formattedSlots}\n\n¿Cuál te funciona mejor? Responde con el número de la opción.`,
        action: "book_appointment",
      };
    } catch (error) {
      console.error("Error handling booking intent:", error);
      return {
        message: "Tuve un problema al revisar la disponibilidad. ¿Me permites transferirte con alguien que te pueda ayudar?",
        shouldEscalate: true,
        escalationReason: "Error al consultar calendario",
      };
    }
  }

  /**
   * Book an appointment
   */
  async bookAppointment(
    context: AgentContext,
    slotIndex: number,
    attendeeInfo: { name?: string; phone?: string; email?: string }
  ): Promise<{ success: boolean; message: string; eventId?: string }> {
    try {
      const slots = await this.getAvailableSlots(context.workspaceId);
      
      if (slotIndex < 0 || slotIndex >= slots.length) {
        return {
          success: false,
          message: "Ese horario no está disponible. ¿Podrías elegir otra opción?",
        };
      }

      const slot = slots[slotIndex];
      
      const response = await fetch(`${this.appUrl}/api/calendar/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: slot.start,
          endTime: slot.end,
          title: `Cita con ${attendeeInfo.name || "Cliente"}`,
          attendeeName: attendeeInfo.name,
          attendeePhone: attendeeInfo.phone || context.contactPhone,
          attendeeEmail: attendeeInfo.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      const data = await response.json();
      
      const date = new Date(slot.start);
      const formattedDate = date.toLocaleDateString("es-MX", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        success: true,
        message: `¡Listo! Tu cita quedó agendada para el ${formattedDate}. Te enviaremos un recordatorio antes de la cita. ¿Hay algo más en lo que pueda ayudarte?`,
        eventId: data.eventId,
      };
    } catch (error) {
      console.error("Error booking appointment:", error);
      return {
        success: false,
        message: "No pude agendar la cita. ¿Te gustaría que te contacte un asesor para hacerlo manualmente?",
      };
    }
  }

  /**
   * Get available calendar slots
   */
  private async getAvailableSlots(workspaceId: string): Promise<CalendarSlot[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

      const response = await fetch(
        `${this.appUrl}/api/calendar/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&workspaceId=${workspaceId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      return data.slots || [];
    } catch (error) {
      console.error("Error fetching availability:", error);
      return [];
    }
  }

  /**
   * Generate escalation response
   */
  private generateEscalationResponse(reason?: string): AgentResponse {
    const messages: Record<string, string> = {
      FRUSTRATED_CUSTOMER: "Entiendo que estás frustrado y lamento mucho la situación. Déjame transferirte con un asesor que podrá ayudarte mejor.",
      EXPLICIT_REQUEST: "¡Por supuesto! Te transfiero con uno de nuestros asesores. En un momento te contactarán.",
      HIGH_VALUE: "Este es un caso especial que requiere atención personalizada. Un asesor especializado te contactará en breve.",
      COMPLAINT: "Lamento mucho que hayas tenido esta experiencia. Voy a escalar tu caso para que recibas la atención que mereces.",
      CANCELLATION: "Entiendo. Para procesar tu solicitud correctamente, te transfiero con un asesor que podrá ayudarte.",
      REPEATED_FAILURE: "Parece que no estoy pudiendo ayudarte correctamente. Déjame transferirte con alguien que pueda.",
      default: "Voy a transferirte con un asesor humano para ayudarte mejor.",
    };

    return {
      message: messages[reason || "default"] || messages.default,
      action: "transfer_to_human",
      shouldEscalate: true,
      escalationReason: reason,
    };
  }

  /**
   * Generate AI response
   */
  private async generateResponse(
    context: AgentContext,
    userMessage: string,
    history: ConversationMessage[],
    analysis: ConversationAnalysis
  ): Promise<AgentResponse> {
    // In production, this would call OpenAI or another LLM
    // For now, generate template-based responses
    
    const { intent, topic } = analysis;
    
    const responses: Record<string, string> = {
      greeting: "¡Hola! 👋 Gracias por contactarnos. ¿En qué puedo ayudarte hoy?",
      ask_price: "Con gusto te doy información sobre nuestros precios. ¿Podrías decirme qué servicio o producto te interesa?",
      ask_info: "¡Claro! Estoy aquí para darte toda la información que necesites. ¿Qué te gustaría saber?",
      support: "Entiendo que necesitas ayuda. Cuéntame más sobre el problema para poder asistirte.",
      purchase: "¡Excelente decisión! Me encantará ayudarte con tu compra. ¿Qué producto o servicio te interesa?",
      followup: "Gracias por dar seguimiento. Déjame revisar el estado de tu caso.",
      thanks: "¡De nada! Fue un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?",
      goodbye: "¡Hasta luego! Que tengas un excelente día. No dudes en escribirnos si necesitas algo más.",
      general_inquiry: "Gracias por tu mensaje. ¿Podrías darme más detalles para poder ayudarte mejor?",
    };

    return {
      message: responses[intent] || responses.general_inquiry,
    };
  }

  /**
   * Get agent configuration
   */
  async getAgentConfig(agentId: string): Promise<{
    name: string;
    template: string;
    systemPrompt: string;
    voiceId?: string;
    language: string;
  } | null> {
    try {
      const response = await fetch(`${this.appUrl}/api/agents?id=${agentId}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const agent = data.agents?.[0];
      
      if (!agent) return null;

      return {
        name: agent.name,
        template: agent.template,
        systemPrompt: agent.systemPrompt || SYSTEM_PROMPTS[agent.template as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.CUSTOM,
        voiceId: agent.voiceId,
        language: agent.language || "es-MX",
      };
    } catch (error) {
      console.error("Error fetching agent config:", error);
      return null;
    }
  }
}

export const agentService = new AgentService();
export type { AgentContext, AgentResponse, ConversationMessage };

