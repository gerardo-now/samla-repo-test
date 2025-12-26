import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// This API confirms caller ID verification using Twilio internally
// The provider name is NEVER exposed to the frontend

interface ConfirmRequest {
  verificationId: string;
  code: string;
  workspaceId: string;
  phoneNumber: string;
  friendlyName?: string;
}

// POST /api/caller-id/confirm - Confirm verification code
export async function POST(req: NextRequest) {
  try {
    const body: ConfirmRequest = await req.json();
    const { verificationId, code, workspaceId, phoneNumber, friendlyName } = body;

    if (!verificationId || !code || !workspaceId) {
      return NextResponse.json(
        { error: "Datos de verificación incompletos" },
        { status: 400 }
      );
    }

    // In production: Verify with Twilio that the caller ID is now verified
    // Twilio's validation happens via phone call, we check the status
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const outgoingCallerIds = await twilio.outgoingCallerIds.list({
    //   phoneNumber: phoneNumber,
    // });
    
    // For demo: Simulate successful verification
    // In production, we'd check if Twilio has verified the number

    // Create the caller ID record
    const callerId = await db.callerId.create({
      data: {
        workspaceId,
        phoneNumber: phoneNumber.replace(/\s/g, ''),
        friendlyName: friendlyName || null,
        isVerified: true,
        isDefault: false, // Will be set to true if it's the first one
      },
    });

    // If this is the first caller ID, make it default
    const count = await db.callerId.count({
      where: { workspaceId },
    });

    if (count === 1) {
      await db.callerId.update({
        where: { id: callerId.id },
        data: { isDefault: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Número verificado correctamente",
      callerId: {
        id: callerId.id,
        phoneNumber: callerId.phoneNumber,
        friendlyName: callerId.friendlyName,
        isVerified: callerId.isVerified,
        isDefault: count === 1,
      },
    });

  } catch (error) {
    console.error("Error confirming caller ID:", error);
    return NextResponse.json(
      { error: "Error al verificar el número" },
      { status: 500 }
    );
  }
}

