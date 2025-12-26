import { NextRequest, NextResponse } from "next/server";

// This API uses Twilio's Outgoing Caller ID verification internally
// The provider name is NEVER exposed to the frontend

interface VerifyRequest {
  phoneNumber: string;
  friendlyName?: string;
  workspaceId: string;
}

// POST /api/caller-id/verify - Initiate verification call
export async function POST(req: NextRequest) {
  try {
    const body: VerifyRequest = await req.json();
    const { phoneNumber, friendlyName, workspaceId } = body;

    if (!phoneNumber || !workspaceId) {
      return NextResponse.json(
        { error: "Número de teléfono requerido" },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/\s/g, '');
    
    // In production: Use Twilio's Outgoing Caller ID API
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const validationRequest = await twilio.validationRequests.create({
    //   phoneNumber: normalizedPhone,
    //   friendlyName: friendlyName || normalizedPhone,
    // });

    // For now, simulate the response
    const validationSid = `VA${Date.now()}`;
    const validationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // In production: Store pending verification in database
    // await db.callerIdVerification.create({
    //   data: {
    //     workspaceId,
    //     phoneNumber: normalizedPhone,
    //     friendlyName,
    //     validationSid,
    //     validationCode,
    //     status: 'PENDING',
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Llamada de verificación iniciada",
      verificationId: validationSid,
      // Note: In production, the code is spoken via phone call, never returned here
    });

  } catch (error) {
    console.error("Error initiating caller ID verification:", error);
    return NextResponse.json(
      { error: "Error al iniciar la verificación" },
      { status: 500 }
    );
  }
}

