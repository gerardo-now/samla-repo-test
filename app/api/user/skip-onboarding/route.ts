import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  try {
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

