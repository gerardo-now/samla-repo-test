import { NextRequest, NextResponse } from "next/server";
import { callService } from "@/lib/services/callService";

/**
 * Transfer Status Webhook
 * 
 * Called by Twilio after a transfer attempt completes.
 * Handles success/failure and triggers fallback if needed.
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const callSid = formData.get("CallSid") as string;
    const dialCallStatus = formData.get("DialCallStatus") as string;
    const dialCallDuration = formData.get("DialCallDuration") as string;
    const recordingUrl = formData.get("RecordingUrl") as string;
    const parentCallSid = formData.get("ParentCallSid") as string;

    console.log("Transfer status webhook:", {
      callSid,
      dialCallStatus,
      dialCallDuration,
      recordingUrl,
    });

    // Check if transfer was successful
    const transferSuccess = dialCallStatus === "completed" && parseInt(dialCallDuration) > 0;

    if (!transferSuccess) {
      // Transfer failed - return to AI or play fallback message
      console.log(`Transfer failed for call ${callSid}. Status: ${dialCallStatus}`);
      
      // In production, get agent's fallback config from database
      await callService.handleTransferResult(callSid, false, {
        fallbackMessage: "No pudimos conectarte en este momento. ¿Hay algo más en lo que pueda ayudarte?",
      });

      // Return TwiML to continue with AI
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">No fue posible conectar con un asesor en este momento. Un momento por favor.</Say>
  <Pause length="1"/>
  <Redirect>/api/webhooks/calls</Redirect>
</Response>`;

      return new NextResponse(twiml, {
        headers: {
          "Content-Type": "application/xml",
        },
      });
    }

    // Transfer was successful
    console.log(`Transfer completed for call ${callSid}. Duration: ${dialCallDuration}s`);

    // In production:
    // 1. Update call record in database
    // 2. Store recording URL
    // 3. Track transfer metrics

    // End the original call leg gracefully
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup />
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error in transfer status webhook:", error);
    
    // Return empty response on error
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="es-MX">Ha ocurrido un error. Por favor intente más tarde.</Say>
  <Hangup />
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}

