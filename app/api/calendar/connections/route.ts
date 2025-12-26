import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Mock data for demo - in production this would come from database
const mockConnections = [
  {
    id: "cal-1",
    provider: "GOOGLE",
    externalEmail: "usuario@gmail.com",
    calendarName: "Calendario principal",
    isDefault: true,
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    workingDays: [1, 2, 3, 4, 5],
    bufferMinutes: 15,
    defaultDuration: 30,
    syncEnabled: true,
    lastSyncAt: new Date().toISOString(),
    isActive: true,
  },
];

/**
 * GET /api/calendar/connections
 * List all calendar connections for the current user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // In production:
    // const connections = await prisma.calendarConnection.findMany({
    //   where: { userId, isActive: true },
    //   orderBy: { isDefault: 'desc' },
    // });

    return NextResponse.json({
      connections: mockConnections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error al obtener conexiones" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/connections/:id
 * Disconnect a calendar
 */
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("id");

    if (!connectionId) {
      return NextResponse.json(
        { error: "ID de conexión requerido" },
        { status: 400 }
      );
    }

    // In production:
    // await prisma.calendarConnection.delete({
    //   where: { id: connectionId, userId },
    // });

    console.log("Calendar disconnected:", connectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting calendar:", error);
    return NextResponse.json(
      { error: "Error al desconectar calendario" },
      { status: 500 }
    );
  }
}

