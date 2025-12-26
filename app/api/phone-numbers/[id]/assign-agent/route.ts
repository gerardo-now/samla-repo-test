/**
 * Assign Agent to Phone Number
 * 
 * Links a phone number to an AI agent so incoming calls
 * are answered by that agent.
 */

import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: phoneNumberId } = await params;
    const { agentId } = await req.json();

    if (!phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "ID del número es requerido" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Verify phone number exists and belongs to workspace
    // 2. Verify agent exists and belongs to workspace
    // 3. Update phone number with agentId
    // 4. Configure Twilio webhook if needed
    
    // const phoneNumber = await prisma.phoneNumber.update({
    //   where: { id: phoneNumberId },
    //   data: { agentId },
    //   include: { agent: true },
    // });

    console.log(`Assigning agent ${agentId} to phone number ${phoneNumberId}`);

    return NextResponse.json({
      success: true,
      message: agentId 
        ? "Agente asignado al número" 
        : "Agente desvinculado del número",
      phoneNumber: {
        id: phoneNumberId,
        agentId,
      },
    });
  } catch (error) {
    console.error("Error assigning agent:", error);
    return NextResponse.json(
      { success: false, error: "Error al asignar agente" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: phoneNumberId } = await params;

    // Remove agent assignment
    // await prisma.phoneNumber.update({
    //   where: { id: phoneNumberId },
    //   data: { agentId: null },
    // });

    console.log(`Removing agent from phone number ${phoneNumberId}`);

    return NextResponse.json({
      success: true,
      message: "Agente desvinculado del número",
    });
  } catch (error) {
    console.error("Error removing agent:", error);
    return NextResponse.json(
      { success: false, error: "Error al desvincular agente" },
      { status: 500 }
    );
  }
}

