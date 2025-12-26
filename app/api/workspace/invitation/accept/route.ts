import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para aceptar la invitación" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Código de invitación requerido" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Validate invitation from database
    // const invitation = await prisma.workspaceInvitation.findUnique({
    //   where: { code, status: "pending" },
    // });
    // 
    // 2. Check if not expired
    // if (invitation.expiresAt < new Date()) {
    //   return error "Invitación expirada"
    // }
    //
    // 3. Add user to workspace
    // await prisma.workspaceMember.create({
    //   data: {
    //     workspaceId: invitation.workspaceId,
    //     userId,
    //     role: invitation.role,
    //   }
    // });
    //
    // 4. Mark invitation as accepted
    // await prisma.workspaceInvitation.update({
    //   where: { id: invitation.id },
    //   data: { status: "accepted", acceptedAt: new Date() },
    // });

    // Update user metadata to mark they joined via invitation
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        joinedViaInvitation: true,
        // In production: currentWorkspaceId: invitation.workspaceId
        currentWorkspaceId: "demo-workspace",
      },
    });

    console.log("Invitation accepted:", { code, userId });

    return NextResponse.json({
      success: true,
      message: "Te has unido al equipo exitosamente",
      // In production: workspaceId: invitation.workspaceId
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Error al aceptar invitación" },
      { status: 500 }
    );
  }
}

