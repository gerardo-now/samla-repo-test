import { NextRequest, NextResponse } from "next/server";

/**
 * Triggers API
 *
 * CRUD operations for automation triggers
 */

// In-memory storage for demo
const triggers: Map<string, TriggerData> = new Map();

interface TriggerData {
  id: string;
  workspaceId: string;
  name: string;
  isActive: boolean;
  condition: {
    type: "keyword" | "call_outcome" | "no_reply" | "task_overdue";
    value?: string;
    timeoutMinutes?: number;
  };
  action: {
    type: "send_whatsapp" | "start_call" | "create_task" | "schedule_followup";
    templateId?: string;
    message?: string;
    delayMinutes?: number;
  };
  executionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/triggers - List all triggers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "demo-workspace";

    const result = Array.from(triggers.values()).filter(
      (t) => t.workspaceId === workspaceId
    );

    return NextResponse.json({
      success: true,
      triggers: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error listing triggers:", error);
    return NextResponse.json(
      { error: "Error al obtener automatizaciones" },
      { status: 500 }
    );
  }
}

// POST /api/triggers - Create a trigger
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      condition,
      action,
      isActive = true,
      workspaceId = "demo-workspace",
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!condition?.type) {
      return NextResponse.json(
        { error: "La condición es requerida" },
        { status: 400 }
      );
    }

    if (!action?.type) {
      return NextResponse.json(
        { error: "La acción es requerida" },
        { status: 400 }
      );
    }

    const id = `trigger_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newTrigger: TriggerData = {
      id,
      workspaceId,
      name: name.trim(),
      isActive,
      condition,
      action,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    triggers.set(id, newTrigger);

    return NextResponse.json({
      success: true,
      trigger: newTrigger,
    });
  } catch (error) {
    console.error("Error creating trigger:", error);
    return NextResponse.json(
      { error: "Error al crear la automatización" },
      { status: 500 }
    );
  }
}

// PUT /api/triggers - Update a trigger
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID es requerido" },
        { status: 400 }
      );
    }

    const existingTrigger = triggers.get(id);
    if (!existingTrigger) {
      return NextResponse.json(
        { error: "Automatización no encontrada" },
        { status: 404 }
      );
    }

    const updatedTrigger: TriggerData = {
      ...existingTrigger,
      ...updates,
      updatedAt: new Date(),
    };

    triggers.set(id, updatedTrigger);

    return NextResponse.json({
      success: true,
      trigger: updatedTrigger,
    });
  } catch (error) {
    console.error("Error updating trigger:", error);
    return NextResponse.json(
      { error: "Error al actualizar la automatización" },
      { status: 500 }
    );
  }
}

// DELETE /api/triggers?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID es requerido" },
        { status: 400 }
      );
    }

    if (!triggers.has(id)) {
      return NextResponse.json(
        { error: "Automatización no encontrada" },
        { status: 404 }
      );
    }

    triggers.delete(id);

    return NextResponse.json({
      success: true,
      message: "Automatización eliminada",
    });
  } catch (error) {
    console.error("Error deleting trigger:", error);
    return NextResponse.json(
      { error: "Error al eliminar la automatización" },
      { status: 500 }
    );
  }
}

