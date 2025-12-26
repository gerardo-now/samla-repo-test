import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/adminGuard";

/**
 * GET /api/admin/metrics
 * 
 * Get global platform metrics for the admin dashboard.
 * SUPER ADMIN ONLY - SAMLA internal team access.
 */
export async function GET() {
  // Verify super admin access
  const guard = await requireSuperAdmin();
  if (!guard.authorized) return guard.response;

  try {
    // TODO: Calculate from database
    // const metrics = await calculatePlatformMetrics();

    // Mock metrics for development
    const metrics = {
      totalWorkspaces: 156,
      activeSubscriptions: 142,
      trialWorkspaces: 14,
      
      mrr: 45600, // Monthly Recurring Revenue in cents
      arr: 547200, // Annual Recurring Revenue in cents
      
      totalConversationsThisMonth: 28450,
      totalMinutesThisMonth: 4230,
      
      workspacesByPlan: {
        starter: 45,
        growth: 67,
        pro: 38,
        enterprise: 6,
      },
      
      topRegions: [
        { region: "LATAM", workspaces: 98, mrr: 28000 },
        { region: "NA", workspaces: 42, mrr: 14000 },
        { region: "EU", workspaces: 16, mrr: 3600 },
      ],
      
      recentSignups: 12,
      churnThisMonth: 2,
      
      usage: {
        averageConversationsPerWorkspace: 182,
        averageMinutesPerWorkspace: 27,
        peakHour: 14, // 2 PM
        busiestDay: "martes",
      },
    };

    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}

