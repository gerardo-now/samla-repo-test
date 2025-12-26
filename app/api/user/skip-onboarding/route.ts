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

export async function POST() {
  try {
    // If Clerk is not configured, just return success
    if (!isClerkConfigured()) {
      return NextResponse.json({
        success: true,
        message: "Onboarding saltado (Clerk no configurado)",
      });
    }

    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Mark onboarding as skipped (not complete, but user chose to skip)
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingSkipped: true,
        onboardingSkippedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding saltado",
    });
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return NextResponse.json(
      { error: "Error" },
      { status: 500 }
    );
  }
}
