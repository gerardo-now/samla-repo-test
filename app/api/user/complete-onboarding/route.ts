import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Check if Clerk is configured
function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  if (!key || !secret) return false;
  if (!key.startsWith("pk_")) return false;
  if (key.length < 50) return false;
  return true;
}

export async function POST(req: Request) {
  try {
    // If Clerk is not configured, just return success
    if (!isClerkConfigured()) {
      return NextResponse.json({
        success: true,
        message: "Onboarding completado (Clerk no configurado)",
      });
    }

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
