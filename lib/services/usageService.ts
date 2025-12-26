/**
 * Usage Service
 * 
 * Handles usage tracking, aggregation, and reporting
 */

import { db } from '@/lib/db';

export async function getWorkspaceUsageHistory(workspaceId: string, months: number = 6) {
  const usage = await db.workspaceUsageMonthly.findMany({
    where: { workspaceId },
    orderBy: { periodStart: 'desc' },
    take: months,
  });

  return usage.map((u) => ({
    periodStart: u.periodStart,
    periodEnd: u.periodEnd,
    callMinutesUsed: Number(u.callMinutesUsed),
    whatsappConversationsUsed: u.whatsappConversationsUsed,
    seatsUsed: u.seatsUsed,
    agentsUsed: u.agentsUsed,
  }));
}

export async function getUsageEventsByType(
  workspaceId: string,
  type: 'CALL_MINUTE' | 'WHATSAPP_CONVERSATION',
  startDate: Date,
  endDate: Date
) {
  return db.usageEvent.findMany({
    where: {
      workspaceId,
      type,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function aggregateUsageByRegion() {
  const workspaces = await db.workspace.findMany({
    include: {
      subscription: true,
      usageMonthly: {
        orderBy: { periodStart: 'desc' },
        take: 1,
      },
    },
  });

  const byRegion: Record<string, {
    workspaceCount: number;
    totalCallMinutes: number;
    totalConversations: number;
    totalRevenue: number;
  }> = {};

  for (const workspace of workspaces) {
    if (!workspace.subscription) continue;

    const regionCode = workspace.subscription.regionCode;
    const usage = workspace.usageMonthly[0];

    if (!byRegion[regionCode]) {
      byRegion[regionCode] = {
        workspaceCount: 0,
        totalCallMinutes: 0,
        totalConversations: 0,
        totalRevenue: 0,
      };
    }

    byRegion[regionCode].workspaceCount++;
    byRegion[regionCode].totalCallMinutes += Number(usage?.callMinutesUsed ?? 0);
    byRegion[regionCode].totalConversations += usage?.whatsappConversationsUsed ?? 0;

    // Get plan pricing for revenue calculation
    const planRegion = await db.planRegion.findFirst({
      where: {
        plan: { code: workspace.subscription.planCode },
        regionCode,
      },
    });

    if (planRegion) {
      byRegion[regionCode].totalRevenue += Number(planRegion.displayPriceMonthly);
    }
  }

  return byRegion;
}

export async function calculateMarginsByRegion() {
  const usageByRegion = await aggregateUsageByRegion();
  const costAssumptions = await db.regionCostAssumption.findMany();

  const costMap = new Map(costAssumptions.map((c) => [c.regionCode, c]));
  const margins: Record<string, {
    regionCode: string;
    revenue: number;
    estimatedCogs: number;
    estimatedMargin: number;
    marginPercent: number;
  }> = {};

  for (const [regionCode, data] of Object.entries(usageByRegion)) {
    const costs = costMap.get(regionCode);

    const estimatedCogs = costs
      ? Number(costs.callCostPerMinute) * data.totalCallMinutes +
        Number(costs.whatsappCostPerConversation) * data.totalConversations
      : 0;

    const estimatedMargin = data.totalRevenue - estimatedCogs;
    const marginPercent = data.totalRevenue > 0 ? (estimatedMargin / data.totalRevenue) * 100 : 0;

    margins[regionCode] = {
      regionCode,
      revenue: data.totalRevenue,
      estimatedCogs,
      estimatedMargin,
      marginPercent,
    };
  }

  return margins;
}

export async function getGlobalMetrics() {
  const activeSubscriptions = await db.workspaceSubscription.count({
    where: { status: 'ACTIVE' },
  });

  const allSubscriptions = await db.workspaceSubscription.findMany({
    where: { status: 'ACTIVE' },
    include: {
      workspace: {
        include: {
          usageMonthly: {
            orderBy: { periodStart: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  let totalMrr = 0;
  let totalCallMinutes = 0;
  let totalConversations = 0;

  for (const sub of allSubscriptions) {
    const planRegion = await db.planRegion.findFirst({
      where: {
        plan: { code: sub.planCode },
        regionCode: sub.regionCode,
      },
    });

    if (planRegion) {
      totalMrr += Number(planRegion.displayPriceMonthly);
    }

    const usage = sub.workspace.usageMonthly[0];
    if (usage) {
      totalCallMinutes += Number(usage.callMinutesUsed);
      totalConversations += usage.whatsappConversationsUsed;
    }
  }

  return {
    activeSubscriptions,
    totalMrr,
    totalCallMinutes,
    totalConversations,
  };
}

