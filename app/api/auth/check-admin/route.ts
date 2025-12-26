import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { canAccessAdminPanel, isSamlaEmail } from "@/lib/auth/superAdmin";

/**
 * GET /api/auth/check-admin
 * 
 * Check if the current user has super admin access.
 * Only SAMLA internal employees can access the global admin panel.
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ isSuperAdmin: false });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    
    // For now, we check if email is from SAMLA domain
    // In production, also check the isSuperAdmin flag from DB
    const isSamlaTeam = isSamlaEmail(email);
    
    // TODO: Also check database User.isSuperAdmin flag
    // const dbUser = await prisma.user.findUnique({
    //   where: { clerkId: user.id },
    //   select: { isSuperAdmin: true },
    // });
    // const isSuperAdmin = dbUser?.isSuperAdmin && isSamlaTeam;
    
    // For development: also allow access if explicitly set in metadata
    const hasAdminMetadata = user.publicMetadata?.isSuperAdmin === true;
    
    return NextResponse.json({
      isSuperAdmin: isSamlaTeam || hasAdminMetadata,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isSuperAdmin: false });
  }
}

