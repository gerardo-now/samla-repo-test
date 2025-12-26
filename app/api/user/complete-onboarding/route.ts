import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

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
    const { workspaceId, language } = body;

    // Update user public metadata to mark onboarding as complete
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        currentWorkspaceId: workspaceId,
        preferredLanguage: language || "es",
        onboardingCompletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completado",
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Error al completar onboarding" },
      { status: 500 }
    );
  }
}

