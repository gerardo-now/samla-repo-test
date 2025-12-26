/**
 * Telephony Webhook Handler
 * 
 * Handles incoming calls and call status updates.
 * Routes calls to the appropriate AI agent.
 */

import { NextRequest, NextResponse } from "next/server";
import { callService } from "@/lib/services/callService";

// Mock database lookup - in production, query Prisma
async function getPhoneNumberConfig(phoneNumber: string) {
  // This would query:
  // SELECT pn.*, a.*, v.* FROM PhoneNumber pn
  // JOIN Agent a ON pn.agentId = a.id
  // LEFT JOIN Voice v ON a.voiceId = v.id
  // WHERE pn.phoneNumber = $1 AND pn.isActive = true
  
  return {
    id: "pn_mock",
    workspaceId: "ws_mock",
    phoneNumber,
    agent: {
      id: "agent_mock",
      name: "Asistente SAMLA",
      template: "SALES",
      systemPrompt: null,
      language: "es-MX",
      voiceId: "voice_mock",
      voiceName: "Sofia",
      tone: "professional",
      goals: ["Agendar citas", "Responder preguntas"],
      enabledTools: ["scheduleMeeting", "createTask"],
      knowledgeCollectionIds: [],
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const {
      CallSid,
      CallStatus,
      Called,
      Caller,
      Direction,
      CallDuration,
    } = data;

    // Handle different call events
    if (Direction === "inbound" && (!CallStatus || CallStatus === "ringing")) {
      // New incoming call - route to AI agent
      const phoneConfig = await getPhoneNumberConfig(Called);

      if (!phoneConfig || !phoneConfig.agent) {
        // No agent configured, return busy signal
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">Lo sentimos, este número no está disponible en este momento.</Say>
  <Hangup/>
</Response>`;
        return new NextResponse(twiml, {
          headers: { "Content-Type": "application/xml" },
        });
      }

      // Generate TwiML to connect to AI agent
      const { twiml } = await callService.handleIncomingCall(
        Called,
        Caller,
        CallSid
      );

      return new NextResponse(twiml, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Handle status callbacks
    if (CallStatus) {
      await callService.handleCallStatusUpdate(
        CallSid,
        CallStatus,
        CallDuration ? parseInt(CallDuration) : undefined
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling call webhook:", error);
    
    // Return TwiML error response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">Ha ocurrido un error. Por favor intente más tarde.</Say>
  <Hangup/>
</Response>`;
    
    return new NextResponse(twiml, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

// Twilio sends GET requests for voice URL sometimes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const Called = searchParams.get("Called") || "";
  const Caller = searchParams.get("Caller") || "";
  const CallSid = searchParams.get("CallSid") || "";

  if (!Called || !CallSid) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const phoneConfig = await getPhoneNumberConfig(Called);

  if (!phoneConfig || !phoneConfig.agent) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">Lo sentimos, este número no está disponible.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(twiml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const { twiml } = await callService.handleIncomingCall(Called, Caller, CallSid);
  return new NextResponse(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}

