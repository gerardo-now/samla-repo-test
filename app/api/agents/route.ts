import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Agents API
 *
 * CRUD operations for AI agents
 */

// Helper to get workspaceId from header or query (for now, use demo if not available)
function getWorkspaceId(req: NextRequest): string {
  const headerWorkspaceId = req.headers.get("x-workspace-id");
  const { searchParams } = new URL(req.url);
  return headerWorkspaceId || searchParams.get("workspaceId") || "demo-workspace";
}

// GET /api/agents - List all agents
export async function GET(req: NextRequest) {
  try {
    const workspaceId = getWorkspaceId(req);

    // Get agents from database
    const agents = await db.agent.findMany({
      where: { workspaceId },
      include: {
        voice: true,
        _count: {
          select: {
            conversations: true,
            phoneNumbers: true,
            callerIds: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      agents: agents.map(agent => ({
        ...agent,
        conversationCount: agent._count.conversations,
        phoneNumberCount: agent._count.phoneNumbers,
        callerIdCount: agent._count.callerIds,
      })),
      total: agents.length,
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
    const workspaceId = getWorkspaceId(req);
    
    const {
      name,
      template,
      tone,
      language,
      voiceId,
      goals,
      enabledTools,
      isActive,
      description,
      systemPrompt,
      knowledgeCollectionIds,
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del agente es requerido" },
        { status: 400 }
      );
    }

    // Verify workspace exists
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace no encontrado" },
        { status: 404 }
      );
    }

    // Create agent in database
    const newAgent = await db.agent.create({
      data: {
        workspaceId,
        name: name.trim(),
        template: template || "SALES",
        description: description || null,
        systemPrompt: systemPrompt || null,
        tone: tone || "professional",
        language: language || "es-MX",
        voiceId: voiceId || null,
        goals: goals ? (Array.isArray(goals) ? goals : goals.split("\n").filter(Boolean)) : [],
        enabledTools: enabledTools || ["sendWhatsapp", "scheduleMeeting"],
        knowledgeCollectionIds: knowledgeCollectionIds || [],
        isActive: isActive ?? true,
      },
      include: {
        voice: true,
      },
    });

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

    // Check if agent exists
    const existingAgent = await db.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agente no encontrado" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.template !== undefined) updateData.template = updates.template;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.systemPrompt !== undefined) updateData.systemPrompt = updates.systemPrompt;
    if (updates.tone !== undefined) updateData.tone = updates.tone;
    if (updates.language !== undefined) updateData.language = updates.language;
    if (updates.voiceId !== undefined) updateData.voiceId = updates.voiceId || null;
    if (updates.goals !== undefined) {
      updateData.goals = Array.isArray(updates.goals) 
        ? updates.goals 
        : updates.goals.split("\n").filter(Boolean);
    }
    if (updates.enabledTools !== undefined) updateData.enabledTools = updates.enabledTools;
    if (updates.knowledgeCollectionIds !== undefined) updateData.knowledgeCollectionIds = updates.knowledgeCollectionIds;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    // Update agent
    const updatedAgent = await db.agent.update({
      where: { id },
      data: updateData,
      include: {
        voice: true,
      },
    });

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

    // Check if agent exists
    const existingAgent = await db.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agente no encontrado" },
        { status: 404 }
      );
    }

    // Delete agent
    await db.agent.delete({
      where: { id },
    });

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
