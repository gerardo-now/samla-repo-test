import { NextRequest, NextResponse } from "next/server";
import { callService } from "@/lib/services/callService";

/**
 * Call Transfer API
 * 
 * Handles transfer requests for active calls.
 * Supports:
 * - Transfer to human (phone number)
 * - Transfer to another AI agent
 * - Warm transfer with announcement
 */

interface TransferRequest {
  callSid: string;
  type: "human" | "agent" | "warm";
  destination: string; // Phone number or agent ID
  options?: {
    announceMessage?: string;
    callerId?: string;
    timeout?: number;
    whisperToAgent?: string;
    context?: Record<string, unknown>;
  };
}

// POST /api/calls/transfer - Execute a call transfer
export async function POST(req: NextRequest) {
  try {
    const body: TransferRequest = await req.json();
    const { callSid, type, destination, options } = body;

    // Validate required fields
    if (!callSid) {
      return NextResponse.json(
        { error: "ID de llamada requerido" },
        { status: 400 }
      );
    }

    if (!type || !["human", "agent", "warm"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo de transferencia inválido" },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: "Destino de transferencia requerido" },
        { status: 400 }
      );
    }

    let result: { success: boolean; error?: string };

    switch (type) {
      case "human":
        result = await callService.transferToHuman(callSid, destination, {
          announceMessage: options?.announceMessage,
          callerId: options?.callerId,
          timeout: options?.timeout,
          record: true,
        });
        break;

      case "agent":
        result = await callService.transferToAgent(callSid, destination, {
          announceMessage: options?.announceMessage,
          context: options?.context,
        });
        break;

      case "warm":
        result = await callService.warmTransfer(callSid, destination, {
          whisperToAgent: options?.whisperToAgent,
          timeout: options?.timeout,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de transferencia no soportado" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Transferencia iniciada",
        type,
        destination,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Error al transferir la llamada" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in transfer API:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la transferencia" },
      { status: 500 }
    );
  }
}

// GET /api/calls/transfer/status - Get transfer status for a call
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callSid = searchParams.get("callSid");

    if (!callSid) {
      return NextResponse.json(
        { error: "ID de llamada requerido" },
        { status: 400 }
      );
    }

    // In production, fetch transfer status from database
    return NextResponse.json({
      success: true,
      callSid,
      transferStatus: "unknown", // pending, in-progress, completed, failed
      message: "Estado de transferencia",
    });
  } catch (error) {
    console.error("Error getting transfer status:", error);
    return NextResponse.json(
      { error: "Error al obtener estado de transferencia" },
      { status: 500 }
    );
  }
}

