import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface PublicMetadata {
  onboardingComplete?: boolean;
  onboardingSkipped?: boolean;
  joinedViaInvitation?: boolean;
  currentWorkspaceId?: string;
  preferredLanguage?: string;
}

export async function GET() {
  try {
    const { userId, orgId, orgSlug } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        needsOnboarding: false,
        hasWorkspace: false,
      });
    }

    const user = await currentUser();
    const metadata = (user?.publicMetadata || {}) as PublicMetadata;
    
    // Check if user has completed or skipped onboarding
    const onboardingComplete = metadata.onboardingComplete === true;
    const onboardingSkipped = metadata.onboardingSkipped === true;
    
    // Check if user belongs to any organization
    const hasOrganization = !!orgId;
    
    // User needs onboarding if:
    // - They haven't completed onboarding AND
    // - They haven't skipped onboarding AND
    // - They don't belong to any organization (not invited)
    const needsOnboarding = !onboardingComplete && !onboardingSkipped && !hasOrganization;
    
    // Check if user was invited
    const wasInvited = metadata.joinedViaInvitation === true;
    
    return NextResponse.json({
      authenticated: true,
      userId,
      email: user?.emailAddresses[0]?.emailAddress,
      fullName: user?.fullName || user?.firstName,
      hasWorkspace: hasOrganization || !!metadata.currentWorkspaceId,
      currentWorkspace: orgId ? {
        id: orgId,
        slug: orgSlug,
      } : metadata.currentWorkspaceId ? {
        id: metadata.currentWorkspaceId,
      } : null,
      needsOnboarding,
      onboardingComplete,
      onboardingSkipped,
      wasInvited,
      preferredLanguage: metadata.preferredLanguage || "es",
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Error checking status" },
      { status: 500 }
    );
  }
}

