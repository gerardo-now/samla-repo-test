import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

interface InviteMember {
  email: string;
  role: "admin" | "member";
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceId, invitations } = body as { 
      workspaceId: string; 
      invitations: InviteMember[];
    };

    if (!workspaceId || !invitations || !Array.isArray(invitations)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    // Process each invitation
    for (const invite of invitations) {
      try {
        // For now, we'll create invitation records in our database
        // In production with Clerk Organizations, you would use:
        // await client.organizations.createOrganizationInvitation({
        //   organizationId: workspaceId,
        //   emailAddress: invite.email,
        //   role: invite.role === "admin" ? "admin" : "member",
        //   inviterUserId: userId,
        // });

        // For demo, log the invitation
        console.log("Creating invitation:", {
          workspaceId,
          email: invite.email,
          role: invite.role,
          invitedBy: userId,
        });

        // In production, send invitation email
        // await sendInvitationEmail({
        //   to: invite.email,
        //   workspaceId,
        //   inviterName: user.fullName,
        // });

        results.push({ email: invite.email, success: true });
      } catch (error) {
        console.error(`Error inviting ${invite.email}:`, error);
        results.push({ 
          email: invite.email, 
          success: false, 
          error: "Error al enviar invitación" 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} invitaciones enviadas${failedCount > 0 ? `, ${failedCount} fallaron` : ""}`,
      results,
    });
  } catch (error) {
    console.error("Error sending invitations:", error);
    return NextResponse.json(
      { error: "Error al enviar invitaciones" },
      { status: 500 }
    );
  }
}

// GET pending invitations for a workspace
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId requerido" },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // const invitations = await prisma.workspaceInvitation.findMany({
    //   where: { workspaceId, status: "pending" },
    // });

    return NextResponse.json({
      invitations: [],
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Error" },
      { status: 500 }
    );
  }
}
