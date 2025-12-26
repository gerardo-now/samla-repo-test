import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Contacts API
 *
 * CRUD operations for CRM contacts
 */

// Helper to get workspaceId from header or query
function getWorkspaceId(req: NextRequest): string {
  const headerWorkspaceId = req.headers.get("x-workspace-id");
  const { searchParams } = new URL(req.url);
  return headerWorkspaceId || searchParams.get("workspaceId") || "demo-workspace";
}

// GET /api/contacts - List all contacts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = getWorkspaceId(req);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();
    const needsReview = searchParams.get("needsReview");
    const segment = searchParams.get("segment");

    // Build where clause
    const where: Prisma.ContactWhereInput = {
      workspaceId,
    };

    // Filter by status
    if (status && status !== "all") {
      where.status = status.toUpperCase() as "PROSPECT" | "CLIENT" | "LOST";
    }

    // Filter by needs human review
    if (needsReview === "true") {
      where.needsHumanReview = true;
    }

    // Filter by AI segment
    if (segment) {
      where.aiSegment = segment as Prisma.EnumContactSegmentNullableFilter["equals"];
    }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const contacts = await db.contact.findMany({
      where,
      include: {
        _count: {
          select: {
            conversations: true,
            tasks: true,
            notes: true,
          },
        },
      },
      orderBy: { lastContactAt: { sort: "desc", nulls: "last" } },
    });

    return NextResponse.json({
      success: true,
      contacts: contacts.map(contact => ({
        ...contact,
        conversationCount: contact._count.conversations,
        taskCount: contact._count.tasks,
        noteCount: contact._count.notes,
      })),
      total: contacts.length,
    });
  } catch (error) {
    console.error("Error listing contacts:", error);
    return NextResponse.json(
      { error: "Error al obtener contactos" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const workspaceId = getWorkspaceId(req);
    
    const {
      firstName,
      lastName,
      phone,
      email,
      company,
      status = "PROSPECT",
      tags = [],
    } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Check for duplicate phone/email in workspace
    if (phone) {
      const existingByPhone = await db.contact.findUnique({
        where: { workspaceId_phone: { workspaceId, phone: phone.trim() } },
      });
      if (existingByPhone) {
        return NextResponse.json(
          { error: "Ya existe un contacto con este teléfono" },
          { status: 400 }
        );
      }
    }

    if (email) {
      const existingByEmail = await db.contact.findUnique({
        where: { workspaceId_email: { workspaceId, email: email.trim().toLowerCase() } },
      });
      if (existingByEmail) {
        return NextResponse.json(
          { error: "Ya existe un contacto con este email" },
          { status: 400 }
        );
      }
    }

    const newContact = await db.contact.create({
      data: {
        workspaceId,
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        company: company?.trim() || null,
        status: status.toUpperCase() as "PROSPECT" | "CLIENT" | "LOST",
        tags,
      },
    });

    return NextResponse.json({
      success: true,
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Error al crear el contacto" },
      { status: 500 }
    );
  }
}

// PUT /api/contacts - Update a contact
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID del contacto es requerido" },
        { status: 400 }
      );
    }

    const existingContact = await db.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Prisma.ContactUpdateInput = {};
    
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.email !== undefined) updateData.email = updates.email?.toLowerCase() || null;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.status !== undefined) updateData.status = updates.status.toUpperCase();
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.lastContactAt !== undefined) updateData.lastContactAt = updates.lastContactAt;
    if (updates.nextActionAt !== undefined) updateData.nextActionAt = updates.nextActionAt;
    if (updates.nextActionNote !== undefined) updateData.nextActionNote = updates.nextActionNote;
    
    // Clear human review if reviewed
    if (updates.needsHumanReview === false) {
      updateData.needsHumanReview = false;
      updateData.reviewedAt = new Date();
    }

    const updatedContact = await db.contact.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Error al actualizar el contacto" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts?id=xxx - Delete a contact
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del contacto es requerido" },
        { status: 400 }
      );
    }

    const existingContact = await db.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    await db.contact.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Contacto eliminado",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Error al eliminar el contacto" },
      { status: 500 }
    );
  }
}
