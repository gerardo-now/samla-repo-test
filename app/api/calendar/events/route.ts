import { NextRequest, NextResponse } from "next/server";

/**
 * Calendar Events API
 *
 * CRUD operations for calendar events/appointments
 */

// In-memory storage for demo
const events: Map<string, EventData> = new Map();

interface EventData {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  contactId?: string;
  contactName?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
}

// Seed demo events
function seedDemoEvents() {
  if (events.size === 0) {
    const now = new Date();
    const demoEvents: Omit<EventData, "id">[] = [
      {
        workspaceId: "demo-workspace",
        title: "Llamada con Carlos García",
        description: "Seguimiento de propuesta comercial",
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 hours
        endTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
        contactName: "Carlos García",
        status: "scheduled",
        createdAt: new Date(),
      },
      {
        workspaceId: "demo-workspace",
        title: "Demo del producto",
        description: "Demostración para nuevo prospecto",
        startTime: new Date(now.getTime() + 26 * 60 * 60 * 1000), // +1 day
        endTime: new Date(now.getTime() + 27 * 60 * 60 * 1000),
        contactName: "María Rodríguez",
        location: "Zoom",
        status: "scheduled",
        createdAt: new Date(),
      },
      {
        workspaceId: "demo-workspace",
        title: "Reunión de seguimiento",
        startTime: new Date(now.getTime() + 50 * 60 * 60 * 1000), // +2 days
        endTime: new Date(now.getTime() + 51 * 60 * 60 * 1000),
        status: "scheduled",
        createdAt: new Date(),
      },
    ];

    demoEvents.forEach((event, index) => {
      const id = `event_demo_${index + 1}`;
      events.set(id, { ...event, id });
    });
  }
}

seedDemoEvents();

// GET /api/calendar/events - List events
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "demo-workspace";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let result = Array.from(events.values()).filter(
      (e) => e.workspaceId === workspaceId
    );

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((e) => e.startTime >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      result = result.filter((e) => e.startTime <= end);
    }

    // Sort by start time
    result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return NextResponse.json({
      success: true,
      events: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error listing events:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events - Create event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      startTime,
      endTime,
      contactId,
      contactName,
      location,
      workspaceId = "demo-workspace",
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Las fechas son requeridas" },
        { status: 400 }
      );
    }

    const id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newEvent: EventData = {
      id,
      workspaceId,
      title: title.trim(),
      description: description?.trim(),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      contactId,
      contactName,
      location: location?.trim(),
      status: "scheduled",
      createdAt: new Date(),
    };

    events.set(id, newEvent);

    return NextResponse.json({
      success: true,
      event: newEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error al crear el evento" },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/events - Update event
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID del evento es requerido" },
        { status: 400 }
      );
    }

    const existingEvent = events.get(id);
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const updatedEvent: EventData = {
      ...existingEvent,
      ...updates,
      startTime: updates.startTime ? new Date(updates.startTime) : existingEvent.startTime,
      endTime: updates.endTime ? new Date(updates.endTime) : existingEvent.endTime,
    };

    events.set(id, updatedEvent);

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error al actualizar el evento" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/events?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del evento es requerido" },
        { status: 400 }
      );
    }

    if (!events.has(id)) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    events.delete(id);

    return NextResponse.json({
      success: true,
      message: "Evento eliminado",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error al eliminar el evento" },
      { status: 500 }
    );
  }
}

