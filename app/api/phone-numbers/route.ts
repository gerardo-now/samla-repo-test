/**
 * Phone Numbers API
 * 
 * Manage phone numbers and their agent assignments.
 */

import { NextRequest, NextResponse } from "next/server";

// Mock data - in production, use Prisma
const mockPhoneNumbers = [
  {
    id: "pn_1",
    workspaceId: "ws_mock",
    phoneNumber: "+525512345678",
    friendlyName: "Línea Principal",
    country: "MX",
    agentId: null,
    agentName: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // In production: query prisma.phoneNumber.findMany with agent relation
    return NextResponse.json({
      success: true,
      phoneNumbers: mockPhoneNumbers,
    });
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener números" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, friendlyName, country, agentId } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "El número de teléfono es requerido" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Verify number with Twilio
    // 2. Configure webhook URL
    // 3. Save to database

    const newPhoneNumber = {
      id: `pn_${Date.now()}`,
      workspaceId: "ws_mock",
      phoneNumber,
      friendlyName: friendlyName || phoneNumber,
      country: country || "MX",
      agentId: agentId || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      phoneNumber: newPhoneNumber,
    });
  } catch (error) {
    console.error("Error creating phone number:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear número" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, friendlyName, agentId, isActive } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del número es requerido" },
        { status: 400 }
      );
    }

    // In production: prisma.phoneNumber.update
    // When agentId changes, update Twilio webhook URL if needed

    return NextResponse.json({
      success: true,
      phoneNumber: {
        id,
        friendlyName,
        agentId,
        isActive,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating phone number:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar número" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del número es requerido" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Release number from Twilio
    // 2. Delete from database

    return NextResponse.json({
      success: true,
      message: "Número eliminado",
    });
  } catch (error) {
    console.error("Error deleting phone number:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar número" },
      { status: 500 }
    );
  }
}

