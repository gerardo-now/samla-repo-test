import { NextRequest, NextResponse } from "next/server";

/**
 * Whisper API for Warm Transfers
 * 
 * Called when connecting a human agent in a warm transfer.
 * Plays a private message to the agent before connecting the caller.
 */

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const message = searchParams.get("message") || "Llamada entrante de cliente";
    
    // Parse form data from Twilio
    const formData = await req.formData();
    const callSid = formData.get("CallSid") as string;
    const callerNumber = formData.get("Caller") as string;

    console.log("Whisper for call:", callSid, "from:", callerNumber);

    // Generate TwiML that plays a whisper to the agent
    // Then gathers input to accept or reject the call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">${message}</Say>
  <Say language="es-MX">Llamada de ${callerNumber || "número desconocido"}.</Say>
  <Gather numDigits="1" action="/api/calls/accept-transfer" timeout="10">
    <Say language="es-MX">Presione 1 para aceptar la llamada, o cuelgue para rechazar.</Say>
  </Gather>
  <Say language="es-MX">No se recibió respuesta. Rechazando llamada.</Say>
  <Hangup />
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error in whisper:", error);
    
    // Default: just connect the call without whisper
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response />`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}

export async function GET(req: NextRequest) {
  // Support GET for initial whisper
  return POST(req);
}

