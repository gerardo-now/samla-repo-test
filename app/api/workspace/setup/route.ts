import { NextResponse } from "next/server";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, industry, timezone } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la empresa es requerido" },
        { status: 400 }
      );
    }

    if (!industry || typeof industry !== "string") {
      return NextResponse.json(
        { error: "La industria es requerida" },
        { status: 400 }
      );
    }

    // Generate a unique slug
    const baseSlug = generateSlug(name);
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;

    // TODO: Get current user from Clerk and create workspace in database
    // For now, we'll simulate workspace creation
    
    // In production, this would be:
    // const user = await currentUser();
    // const workspace = await prisma.workspace.create({
    //   data: {
    //     name: name.trim(),
    //     slug,
    //     timezone: timezone || "America/Mexico_City",
    //     members: {
    //       create: {
    //         userId: user.id,
    //         role: "OWNER",
    //       },
    //     },
    //     onboardingChecklist: {
    //       create: {},
    //     },
    //   },
    // });

    console.log("Creating workspace:", {
      name: name.trim(),
      slug,
      industry,
      timezone: timezone || "America/Mexico_City",
    });

    // Simulate workspace creation with generated ID
    const workspaceId = `ws_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      workspaceId,
      slug,
      message: "Espacio de trabajo creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Error al crear el espacio de trabajo" },
      { status: 500 }
    );
  }
}

