import { NextRequest, NextResponse } from "next/server";

/**
 * Agents API
 *
 * CRUD operations for AI agents
 */

// In-memory storage for demo (in production, use Prisma)
const agents: Map<string, AgentData> = new Map();

interface AgentData {
  id: string;
  workspaceId: string;
  name: string;
  template: "sales" | "support" | "collections" | "custom";
  tone: string;
  language: string;
  voiceId?: string;
  goals: string;
  enabledTools: string[];
  isActive: boolean;
  conversationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/agents - List all agents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "demo-workspace";

    // Filter agents by workspace
    const workspaceAgents = Array.from(agents.values()).filter(
      (a) => a.workspaceId === workspaceId
    );

    return NextResponse.json({
      success: true,
      agents: workspaceAgents,
      total: workspaceAgents.length,
    });
  } catch (error) {
    console.error("Error listing agents:", error);
    return NextResponse.json(
      { error: "Error al obtener agentes" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      template,
      tone,
      language,
      voiceId,
      goals,
      enabledTools,
      isActive,
      workspaceId = "demo-workspace",
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del agente es requerido" },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newAgent: AgentData = {
      id,
      workspaceId,
      name: name.trim(),
      template: template || "sales",
      tone: tone || "professional",
      language: language || "es-MX",
      voiceId: voiceId || undefined,
      goals: goals || "",
      enabledTools: enabledTools || ["sendWhatsapp", "scheduleMeeting"],
      isActive: isActive ?? true,
      conversationCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save agent
    agents.set(id, newAgent);

    return NextResponse.json({
      success: true,
      agent: newAgent,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Error al crear el agente" },
      { status: 500 }
    );
  }
}

// PUT /api/agents - Update an agent
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID del agente es requerido" },
        { status: 400 }
      );
    }

    const existingAgent = agents.get(id);
    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agente no encontrado" },
        { status: 404 }
      );
    }

    // Update agent
    const updatedAgent: AgentData = {
      ...existingAgent,
      ...updates,
      updatedAt: new Date(),
    };

    agents.set(id, updatedAgent);

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
    });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Error al actualizar el agente" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents?id=xxx - Delete an agent
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del agente es requerido" },
        { status: 400 }
      );
    }

    if (!agents.has(id)) {
      return NextResponse.json(
        { error: "Agente no encontrado" },
        { status: 404 }
      );
    }

    agents.delete(id);

    return NextResponse.json({
      success: true,
      message: "Agente eliminado",
    });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Error al eliminar el agente" },
      { status: 500 }
    );
  }
}

