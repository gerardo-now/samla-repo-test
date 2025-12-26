/**
 * AI Analysis Service
 * 
 * Handles automatic labeling, segmentation, sentiment analysis,
 * and escalation detection for conversations and contacts.
 */

// Types matching Prisma enums
export type ContactSegment = 
  | 'HOT_LEAD'
  | 'WARM_LEAD'
  | 'COLD_LEAD'
  | 'ACTIVE_CLIENT'
  | 'AT_RISK'
  | 'CHURNED'
  | 'VIP'
  | 'SUPPORT_NEEDED'
  | 'UNQUALIFIED';

export type ContactSentiment = 
  | 'VERY_POSITIVE'
  | 'POSITIVE'
  | 'NEUTRAL'
  | 'NEGATIVE'
  | 'VERY_NEGATIVE'
  | 'FRUSTRATED';

export type EscalationReason =
  | 'FRUSTRATED_CUSTOMER'
  | 'COMPLEX_QUESTION'
  | 'EXPLICIT_REQUEST'
  | 'HIGH_VALUE'
  | 'COMPLAINT'
  | 'TECHNICAL_ISSUE'
  | 'CANCELLATION'
  | 'REPEATED_FAILURE'
  | 'SENSITIVE_TOPIC';

// Analysis result interfaces
export interface ConversationAnalysis {
  labels: string[];
  intent: string;
  topic: string;
  summary: string;
  sentiment: ContactSentiment;
  needsEscalation: boolean;
  escalationReason?: EscalationReason;
  confidence: number;
}

export interface ContactAnalysis {
  labels: string[];
  segment: ContactSegment;
  sentiment: ContactSentiment;
  score: number; // 0-100
  summary: string;
  needsHumanReview: boolean;
  escalationReason?: string;
}

// Keywords and patterns for analysis
const ESCALATION_TRIGGERS = {
  FRUSTRATED_CUSTOMER: [
    'molesto', 'enojado', 'furioso', 'harto', 'cansado de',
    'terrible', 'pésimo', 'indignado', 'frustrado', 'decepcionado',
    'angry', 'upset', 'furious', 'frustrated', 'disappointed',
  ],
  EXPLICIT_REQUEST: [
    'quiero hablar con alguien', 'necesito un humano', 'con una persona',
    'gerente', 'supervisor', 'manager', 'human', 'person', 'real person',
    'no me entiende', 'no entiende', 'hablar con alguien de verdad',
  ],
  COMPLAINT: [
    'queja', 'reclamación', 'denuncia', 'demanda', 'abogado',
    'complaint', 'lawyer', 'sue', 'legal',
  ],
  CANCELLATION: [
    'cancelar', 'dar de baja', 'terminar contrato', 'dejar de usar',
    'cancel', 'unsubscribe', 'stop using', 'end service',
  ],
  HIGH_VALUE: [
    'compra grande', 'pedido grande', 'varios', 'muchos', 'empresa grande',
    'corporativo', 'enterprise', 'bulk', 'wholesale',
  ],
};

const INTENT_PATTERNS = {
  book_appointment: ['cita', 'agendar', 'reservar', 'disponibilidad', 'horario', 'appointment', 'book', 'schedule'],
  ask_price: ['precio', 'costo', 'cuánto', 'cotización', 'presupuesto', 'price', 'cost', 'quote'],
  ask_info: ['información', 'detalles', 'cómo funciona', 'qué incluye', 'info', 'details', 'how does'],
  complaint: ['problema', 'error', 'falla', 'no funciona', 'mal', 'issue', 'problem', 'broken'],
  support: ['ayuda', 'soporte', 'asistencia', 'help', 'support', 'assist'],
  purchase: ['comprar', 'adquirir', 'contratar', 'buy', 'purchase', 'get'],
  followup: ['seguimiento', 'estado', 'actualización', 'follow up', 'status', 'update'],
  greeting: ['hola', 'buenos días', 'buenas tardes', 'hi', 'hello', 'hey'],
  thanks: ['gracias', 'thank', 'thanks', 'appreciate'],
  goodbye: ['adiós', 'hasta luego', 'bye', 'goodbye'],
};

const LABEL_PATTERNS = {
  interested: ['interesa', 'me gusta', 'quiero saber más', 'interested', 'like', 'want to know'],
  price_sensitive: ['muy caro', 'descuento', 'oferta', 'expensive', 'discount', 'deal'],
  urgent: ['urgente', 'hoy', 'ahora', 'inmediato', 'urgent', 'asap', 'today', 'now'],
  returning: ['otra vez', 'de nuevo', 'ya soy cliente', 'again', 'returning', 'already a customer'],
  referral: ['recomendación', 'me recomendaron', 'referral', 'recommended'],
  competitor_mention: ['otra empresa', 'competencia', 'competitor', 'other company'],
  decision_maker: ['dueño', 'director', 'gerente', 'owner', 'director', 'manager', 'CEO'],
};

const SENTIMENT_PATTERNS = {
  VERY_POSITIVE: ['excelente', 'increíble', 'maravilloso', 'perfecto', 'amazing', 'excellent', 'perfect', 'love it'],
  POSITIVE: ['bien', 'bueno', 'gracias', 'genial', 'good', 'great', 'thanks', 'nice'],
  NEGATIVE: ['mal', 'malo', 'no me gusta', 'problema', 'bad', 'poor', 'issue', 'don\'t like'],
  VERY_NEGATIVE: ['terrible', 'pésimo', 'horrible', 'awful', 'horrible', 'worst'],
  FRUSTRATED: ['frustrado', 'harto', 'cansado', 'no funciona', 'frustrated', 'fed up', 'doesn\'t work'],
};

/**
 * Analyze a conversation and extract labels, intent, and escalation needs
 */
export function analyzeConversation(messages: Array<{ content: string; direction: 'INBOUND' | 'OUTBOUND' }>): ConversationAnalysis {
  const customerMessages = messages
    .filter(m => m.direction === 'INBOUND')
    .map(m => m.content.toLowerCase())
    .join(' ');

  const allMessages = messages.map(m => m.content.toLowerCase()).join(' ');

  // Detect intent
  let intent = 'general_inquiry';
  let maxIntentMatches = 0;
  for (const [intentName, patterns] of Object.entries(INTENT_PATTERNS)) {
    const matches = patterns.filter(p => customerMessages.includes(p)).length;
    if (matches > maxIntentMatches) {
      maxIntentMatches = matches;
      intent = intentName;
    }
  }

  // Detect labels
  const labels: string[] = [];
  for (const [label, patterns] of Object.entries(LABEL_PATTERNS)) {
    if (patterns.some(p => customerMessages.includes(p))) {
      labels.push(label);
    }
  }

  // Detect sentiment
  let sentiment: ContactSentiment = 'NEUTRAL';
  for (const [sent, patterns] of Object.entries(SENTIMENT_PATTERNS)) {
    if (patterns.some(p => customerMessages.includes(p))) {
      sentiment = sent as ContactSentiment;
      break;
    }
  }

  // Check for escalation
  let needsEscalation = false;
  let escalationReason: EscalationReason | undefined;

  for (const [reason, triggers] of Object.entries(ESCALATION_TRIGGERS)) {
    if (triggers.some(t => customerMessages.includes(t))) {
      needsEscalation = true;
      escalationReason = reason as EscalationReason;
      break;
    }
  }

  // Additional escalation checks
  if (sentiment === 'FRUSTRATED' || sentiment === 'VERY_NEGATIVE') {
    needsEscalation = true;
    if (!escalationReason) escalationReason = 'FRUSTRATED_CUSTOMER';
  }

  // Check for repeated AI failures (multiple "no entiendo" from AI)
  const aiFailurePatterns = ['no entiendo', 'no puedo ayudar', 'no tengo esa información'];
  const aiMessages = messages
    .filter(m => m.direction === 'OUTBOUND')
    .map(m => m.content.toLowerCase())
    .join(' ');
  
  if (aiFailurePatterns.some(p => aiMessages.includes(p))) {
    needsEscalation = true;
    if (!escalationReason) escalationReason = 'REPEATED_FAILURE';
  }

  // Generate topic from intent
  const topicMap: Record<string, string> = {
    book_appointment: 'Agendar cita',
    ask_price: 'Consulta de precios',
    ask_info: 'Solicitud de información',
    complaint: 'Queja o problema',
    support: 'Soporte técnico',
    purchase: 'Intención de compra',
    followup: 'Seguimiento',
    greeting: 'Saludo',
    thanks: 'Agradecimiento',
    goodbye: 'Despedida',
    general_inquiry: 'Consulta general',
  };

  // Generate summary
  const messageCount = messages.length;
  const summary = generateConversationSummary(messages, intent, labels, needsEscalation);

  return {
    labels,
    intent,
    topic: topicMap[intent] || 'Consulta general',
    summary,
    sentiment,
    needsEscalation,
    escalationReason,
    confidence: maxIntentMatches > 0 ? Math.min(0.5 + maxIntentMatches * 0.15, 0.95) : 0.5,
  };
}

/**
 * Analyze a contact based on their conversation history
 */
export function analyzeContact(
  conversations: Array<{
    messages: Array<{ content: string; direction: 'INBOUND' | 'OUTBOUND' }>;
    createdAt: Date;
    status: string;
  }>,
  existingData?: {
    clientSince?: Date | null;
    debtAmount?: number | null;
    status?: string;
  }
): ContactAnalysis {
  const allLabels = new Set<string>();
  let totalSentimentScore = 0;
  let hasEscalation = false;
  let escalationReason: string | undefined;
  let totalConfidence = 0;

  // Analyze each conversation
  for (const conv of conversations) {
    const analysis = analyzeConversation(conv.messages);
    analysis.labels.forEach(l => allLabels.add(l));
    
    // Convert sentiment to score
    const sentimentScores: Record<ContactSentiment, number> = {
      VERY_POSITIVE: 5,
      POSITIVE: 4,
      NEUTRAL: 3,
      NEGATIVE: 2,
      VERY_NEGATIVE: 1,
      FRUSTRATED: 1,
    };
    totalSentimentScore += sentimentScores[analysis.sentiment];
    totalConfidence += analysis.confidence;

    if (analysis.needsEscalation) {
      hasEscalation = true;
      escalationReason = analysis.escalationReason;
    }
  }

  const avgSentiment = conversations.length > 0 ? totalSentimentScore / conversations.length : 3;

  // Determine overall sentiment
  let sentiment: ContactSentiment;
  if (avgSentiment >= 4.5) sentiment = 'VERY_POSITIVE';
  else if (avgSentiment >= 3.5) sentiment = 'POSITIVE';
  else if (avgSentiment >= 2.5) sentiment = 'NEUTRAL';
  else if (avgSentiment >= 1.5) sentiment = 'NEGATIVE';
  else sentiment = 'VERY_NEGATIVE';

  if (hasEscalation && escalationReason === 'FRUSTRATED_CUSTOMER') {
    sentiment = 'FRUSTRATED';
  }

  // Determine segment
  let segment: ContactSegment;
  const labels = Array.from(allLabels);

  if (existingData?.clientSince) {
    if (sentiment === 'NEGATIVE' || sentiment === 'VERY_NEGATIVE' || sentiment === 'FRUSTRATED') {
      segment = 'AT_RISK';
    } else if (labels.includes('interested') || avgSentiment >= 4) {
      segment = 'VIP';
    } else {
      segment = 'ACTIVE_CLIENT';
    }
  } else if (labels.includes('interested') && labels.includes('urgent')) {
    segment = 'HOT_LEAD';
  } else if (labels.includes('interested')) {
    segment = 'WARM_LEAD';
  } else if (labels.includes('price_sensitive') && !labels.includes('interested')) {
    segment = 'COLD_LEAD';
  } else if (hasEscalation) {
    segment = 'SUPPORT_NEEDED';
  } else {
    segment = 'WARM_LEAD';
  }

  // Calculate lead score (0-100)
  let score = 50; // Base score
  
  if (labels.includes('interested')) score += 15;
  if (labels.includes('urgent')) score += 10;
  if (labels.includes('decision_maker')) score += 10;
  if (labels.includes('referral')) score += 5;
  if (labels.includes('returning')) score += 10;
  
  if (labels.includes('price_sensitive')) score -= 5;
  if (labels.includes('competitor_mention')) score -= 10;
  if (sentiment === 'NEGATIVE' || sentiment === 'VERY_NEGATIVE') score -= 15;
  if (hasEscalation) score -= 10;

  score = Math.max(0, Math.min(100, score));

  // Generate summary
  const summary = generateContactSummary(segment, labels, sentiment, conversations.length);

  return {
    labels,
    segment,
    sentiment,
    score,
    summary,
    needsHumanReview: hasEscalation,
    escalationReason,
  };
}

/**
 * Generate a natural language summary for a conversation
 */
function generateConversationSummary(
  messages: Array<{ content: string; direction: 'INBOUND' | 'OUTBOUND' }>,
  intent: string,
  labels: string[],
  needsEscalation: boolean
): string {
  const customerMsgCount = messages.filter(m => m.direction === 'INBOUND').length;
  
  const intentDescriptions: Record<string, string> = {
    book_appointment: 'El cliente quiere agendar una cita',
    ask_price: 'El cliente preguntó por precios',
    ask_info: 'El cliente solicitó información',
    complaint: 'El cliente reportó un problema',
    support: 'El cliente necesita asistencia',
    purchase: 'El cliente quiere realizar una compra',
    followup: 'El cliente dio seguimiento a un tema previo',
    greeting: 'Conversación de saludo',
    thanks: 'El cliente agradeció la atención',
    goodbye: 'Despedida',
    general_inquiry: 'Consulta general del cliente',
  };

  let summary = intentDescriptions[intent] || 'Conversación con el cliente';
  
  if (labels.includes('urgent')) {
    summary += ' (urgente)';
  }
  
  if (needsEscalation) {
    summary += '. Requiere atención humana.';
  }

  summary += ` ${customerMsgCount} mensajes del cliente.`;

  return summary;
}

/**
 * Generate a natural language summary for a contact
 */
function generateContactSummary(
  segment: ContactSegment,
  labels: string[],
  sentiment: ContactSentiment,
  conversationCount: number
): string {
  const segmentDescriptions: Record<ContactSegment, string> = {
    HOT_LEAD: 'Lead muy interesado, listo para comprar',
    WARM_LEAD: 'Lead con interés, necesita seguimiento',
    COLD_LEAD: 'Lead frío, necesita más información',
    ACTIVE_CLIENT: 'Cliente activo',
    AT_RISK: 'Cliente en riesgo de abandono',
    CHURNED: 'Cliente perdido',
    VIP: 'Cliente de alto valor',
    SUPPORT_NEEDED: 'Necesita atención de soporte',
    UNQUALIFIED: 'No calificado como prospecto',
  };

  let summary = segmentDescriptions[segment];
  
  if (labels.includes('decision_maker')) {
    summary += '. Es quien toma las decisiones.';
  }
  
  if (labels.includes('referral')) {
    summary += ' Llegó por referencia.';
  }

  if (sentiment === 'FRUSTRATED' || sentiment === 'VERY_NEGATIVE') {
    summary += ' Requiere atención prioritaria.';
  }

  summary += ` ${conversationCount} conversaciones registradas.`;

  return summary;
}

/**
 * Check if a message should trigger escalation
 */
export function checkMessageForEscalation(content: string): {
  shouldEscalate: boolean;
  reason?: EscalationReason;
} {
  const lowerContent = content.toLowerCase();

  for (const [reason, triggers] of Object.entries(ESCALATION_TRIGGERS)) {
    if (triggers.some(t => lowerContent.includes(t))) {
      return {
        shouldEscalate: true,
        reason: reason as EscalationReason,
      };
    }
  }

  return { shouldEscalate: false };
}

/**
 * Suggest Kanban column based on contact analysis
 */
export function suggestKanbanColumn(analysis: ContactAnalysis): string {
  switch (analysis.segment) {
    case 'HOT_LEAD':
    case 'WARM_LEAD':
    case 'COLD_LEAD':
    case 'UNQUALIFIED':
      return 'PROSPECT';
    case 'ACTIVE_CLIENT':
    case 'VIP':
      return 'CLIENT';
    case 'AT_RISK':
    case 'CHURNED':
      return 'LOST';
    case 'SUPPORT_NEEDED':
      return analysis.needsHumanReview ? 'PROSPECT' : 'CLIENT';
    default:
      return 'PROSPECT';
  }
}

