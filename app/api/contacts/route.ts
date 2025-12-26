import { NextRequest, NextResponse } from "next/server";

/**
 * Contacts API
 *
 * CRUD operations for CRM contacts
 */

// In-memory storage for demo (in production, use Prisma)
const contacts: Map<string, ContactData> = new Map();

interface ContactData {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  company?: string;
  status: "prospect" | "client" | "lost";
  tags: string[];
  notes: string;
  lastContactAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Seed some demo data
function seedDemoData() {
  if (contacts.size === 0) {
    const demoContacts: Omit<ContactData, "id">[] = [
      {
        workspaceId: "demo-workspace",
        firstName: "Carlos",
        lastName: "González",
        phone: "+52 55 1234 5678",
        email: "carlos@empresa.mx",
        company: "TechSolutions MX",
        status: "client",
        tags: ["vip", "tech"],
        notes: "Cliente frecuente, prefiere comunicación por WhatsApp",
        lastContactAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workspaceId: "demo-workspace",
        firstName: "María",
        lastName: "Rodríguez",
        phone: "+52 81 9876 5432",
        email: "maria@innovatech.com",
        company: "InnovaTech",
        status: "prospect",
        tags: ["lead-caliente"],
        notes: "Interesada en el plan empresarial",
        lastContactAt: new Date(Date.now() - 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workspaceId: "demo-workspace",
        firstName: "Roberto",
        lastName: "Martínez",
        phone: "+52 33 5555 4444",
        company: "Digital Agency",
        status: "prospect",
        tags: [],
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    demoContacts.forEach((contact, index) => {
      const id = `contact_demo_${index + 1}`;
      contacts.set(id, { ...contact, id });
    });
  }
}

seedDemoData();

// GET /api/contacts - List all contacts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "demo-workspace";
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();

    let result = Array.from(contacts.values()).filter(
      (c) => c.workspaceId === workspaceId
    );

    // Filter by status
    if (status && status !== "all") {
      result = result.filter((c) => c.status === status);
    }

    // Search filter
    if (search) {
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(search) ||
          c.lastName.toLowerCase().includes(search) ||
          c.phone?.includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.company?.toLowerCase().includes(search)
      );
    }

    // Sort by last contact
    result.sort((a, b) => {
      const dateA = a.lastContactAt?.getTime() || 0;
      const dateB = b.lastContactAt?.getTime() || 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      contacts: result,
      total: result.length,
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
    const {
      firstName,
      lastName,
      phone,
      email,
      company,
      status = "prospect",
      tags = [],
      notes = "",
      workspaceId = "demo-workspace",
    } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newContact: ContactData = {
      id,
      workspaceId,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || "",
      phone: phone?.trim(),
      email: email?.trim(),
      company: company?.trim(),
      status,
      tags,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    contacts.set(id, newContact);

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

    const existingContact = contacts.get(id);
    if (!existingContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    const updatedContact: ContactData = {
      ...existingContact,
      ...updates,
      updatedAt: new Date(),
    };

    contacts.set(id, updatedContact);

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

    if (!contacts.has(id)) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    contacts.delete(id);

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

