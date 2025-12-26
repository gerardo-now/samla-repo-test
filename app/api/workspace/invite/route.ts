import { NextResponse } from "next/server";

interface Invitation {
  email: string;
  role: "admin" | "member";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workspaceId, invitations } = body;

    // Validate required fields
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json(
        { error: "ID del espacio de trabajo es requerido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(invitations) || invitations.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos una invitación" },
        { status: 400 }
      );
    }

    // Validate each invitation
    const validInvitations: Invitation[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const inv of invitations) {
      if (!inv.email || !emailRegex.test(inv.email)) {
        continue;
      }
      if (!inv.role || !["admin", "member"].includes(inv.role)) {
        continue;
      }
      validInvitations.push({
        email: inv.email.toLowerCase().trim(),
        role: inv.role,
      });
    }

    if (validInvitations.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron invitaciones válidas" },
        { status: 400 }
      );
    }

    // TODO: In production, this would:
    // 1. Create invitation records in database
    // 2. Send invitation emails using a service like Resend, SendGrid, etc.
    // 3. Handle Clerk organization invitations if using Clerk Organizations
    
    // Example with Clerk Organizations:
    // const organization = await clerkClient.organizations.getOrganization({ organizationId: workspaceId });
    // for (const inv of validInvitations) {
    //   await clerkClient.organizations.createOrganizationInvitation({
    //     organizationId: workspaceId,
    //     emailAddress: inv.email,
    //     role: inv.role === "admin" ? "admin" : "basic_member",
    //   });
    // }

    console.log("Sending invitations:", {
      workspaceId,
      invitations: validInvitations,
    });

    // Simulate sending invitations
    const results = validInvitations.map((inv) => ({
      email: inv.email,
      status: "sent",
      message: `Invitación enviada a ${inv.email}`,
    }));

    return NextResponse.json({
      success: true,
      sent: results.length,
      results,
      message: `Se enviaron ${results.length} invitaciones`,
    });
  } catch (error) {
    console.error("Error sending invitations:", error);
    return NextResponse.json(
      { error: "Error al enviar las invitaciones" },
      { status: 500 }
    );
  }
}

// GET: List pending invitations for a workspace
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "ID del espacio de trabajo es requerido" },
        { status: 400 }
      );
    }

    // TODO: Fetch pending invitations from database
    // const invitations = await prisma.workspaceInvitation.findMany({
    //   where: { workspaceId, status: "pending" },
    // });

    // Return empty array for now
    return NextResponse.json({
      success: true,
      invitations: [],
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Error al obtener las invitaciones" },
      { status: 500 }
    );
  }
}

