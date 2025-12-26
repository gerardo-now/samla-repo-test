/**
 * Billing Service
 * 
 * Handles billing logic, quota enforcement, and usage tracking
 */

import { db } from '@/lib/db';
import { billingProvider } from '@/lib/providers/billingProvider';

interface QuotaCheck {
  allowed: boolean;
  limitMode: 'soft' | 'hard';
  usage: {
    used: number;
    included: number;
    percentUsed: number;
  };
  warning?: string;
}

export async function checkCallMinuteQuota(workspaceId: string, minutesToAdd: number = 1): Promise<QuotaCheck> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      subscription: true,
      usageMonthly: {
        orderBy: { periodStart: 'desc' },
        take: 1,
      },
      override: true,
    },
  });

  if (!workspace?.subscription) {
    return {
      allowed: false,
      limitMode: 'hard',
      usage: { used: 0, included: 0, percentUsed: 0 },
      warning: 'Sin suscripción activa',
    };
  }

  const planRegion = await db.planRegion.findFirst({
    where: {
      plan: { code: workspace.subscription.planCode },
      regionCode: workspace.subscription.regionCode,
      isActive: true,
    },
  });

  if (!planRegion) {
    return {
      allowed: false,
      limitMode: 'hard',
      usage: { used: 0, included: 0, percentUsed: 0 },
      warning: 'Plan no encontrado',
    };
  }

  const currentUsage = workspace.usageMonthly[0];
  const override = workspace.override;

  const includedMinutes = override?.customIncludedCallMinutes ?? planRegion.includedCallMinutes;
  const usedMinutes = Number(currentUsage?.callMinutesUsed ?? 0);
  const limitMode = override?.customLimitMode ?? planRegion.limitMode;

  const percentUsed = includedMinutes > 0 ? ((usedMinutes + minutesToAdd) / includedMinutes) * 100 : 100;

  if (limitMode === 'HARD' && usedMinutes + minutesToAdd > includedMinutes) {
    return {
      allowed: false,
      limitMode: 'hard',
      usage: { used: usedMinutes, included: includedMinutes, percentUsed },
      warning: 'Límite de minutos excedido',
    };
  }

  let warning: string | undefined;
  if (percentUsed >= 100) {
    warning: 'Has excedido tu límite de minutos incluidos';
  } else if (percentUsed >= 80) {
    warning: 'Te acercas a tu límite de minutos';
  }

  return {
    allowed: true,
    limitMode: limitMode.toLowerCase() as 'soft' | 'hard',
    usage: { used: usedMinutes, included: includedMinutes, percentUsed },
    warning,
  };
}

export async function checkWhatsappConversationQuota(workspaceId: string): Promise<QuotaCheck> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      subscription: true,
      usageMonthly: {
        orderBy: { periodStart: 'desc' },
        take: 1,
      },
      override: true,
    },
  });

  if (!workspace?.subscription) {
    return {
      allowed: false,
      limitMode: 'hard',
      usage: { used: 0, included: 0, percentUsed: 0 },
      warning: 'Sin suscripción activa',
    };
  }

  const planRegion = await db.planRegion.findFirst({
    where: {
      plan: { code: workspace.subscription.planCode },
      regionCode: workspace.subscription.regionCode,
      isActive: true,
    },
  });

  if (!planRegion) {
    return {
      allowed: false,
      limitMode: 'hard',
      usage: { used: 0, included: 0, percentUsed: 0 },
      warning: 'Plan no encontrado',
    };
  }

  const currentUsage = workspace.usageMonthly[0];
  const override = workspace.override;

  const includedConversations = override?.customIncludedWhatsappConversations ?? planRegion.includedWhatsappConversations;
  const usedConversations = currentUsage?.whatsappConversationsUsed ?? 0;
  const limitMode = override?.customLimitMode ?? planRegion.limitMode;

  const percentUsed = includedConversations > 0 ? ((usedConversations + 1) / includedConversations) * 100 : 100;

  if (limitMode === 'HARD' && usedConversations + 1 > includedConversations) {
    return {
      allowed: false,
      limitMode: 'hard',
      usage: { used: usedConversations, included: includedConversations, percentUsed },
      warning: 'Límite de conversaciones excedido',
    };
  }

  let warning: string | undefined;
  if (percentUsed >= 100) {
    warning = 'Has excedido tu límite de conversaciones incluidas';
  } else if (percentUsed >= 80) {
    warning = 'Te acercas a tu límite de conversaciones';
  }

  return {
    allowed: true,
    limitMode: limitMode.toLowerCase() as 'soft' | 'hard',
    usage: { used: usedConversations, included: includedConversations, percentUsed },
    warning,
  };
}

export async function recordCallMinuteUsage(workspaceId: string, minutes: number): Promise<void> {
  const currentUsage = await db.workspaceUsageMonthly.findFirst({
    where: { workspaceId },
    orderBy: { periodStart: 'desc' },
  });

  if (currentUsage) {
    await db.workspaceUsageMonthly.update({
      where: { id: currentUsage.id },
      data: {
        callMinutesUsed: {
          increment: minutes,
        },
      },
    });
  }

  // Also record usage event for detailed tracking
  await db.usageEvent.create({
    data: {
      workspaceId,
      type: 'CALL_MINUTE',
      quantity: minutes,
      unit: 'minutes',
    },
  });
}

export async function recordWhatsappConversationUsage(workspaceId: string): Promise<void> {
  const currentUsage = await db.workspaceUsageMonthly.findFirst({
    where: { workspaceId },
    orderBy: { periodStart: 'desc' },
  });

  if (currentUsage) {
    await db.workspaceUsageMonthly.update({
      where: { id: currentUsage.id },
      data: {
        whatsappConversationsUsed: {
          increment: 1,
        },
      },
    });
  }

  // Also record usage event
  await db.usageEvent.create({
    data: {
      workspaceId,
      type: 'WHATSAPP_CONVERSATION',
      quantity: 1,
      unit: 'conversation',
    },
  });
}

export async function getWorkspaceUsageSummary(workspaceId: string) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      subscription: true,
      usageMonthly: {
        orderBy: { periodStart: 'desc' },
        take: 1,
      },
      override: true,
      _count: {
        select: {
          members: true,
          agents: true,
          phoneNumbers: true,
        },
      },
    },
  });

  if (!workspace?.subscription) {
    return null;
  }

  const planRegion = await db.planRegion.findFirst({
    where: {
      plan: { code: workspace.subscription.planCode },
      regionCode: workspace.subscription.regionCode,
      isActive: true,
    },
  });

  if (!planRegion) {
    return null;
  }

  const currentUsage = workspace.usageMonthly[0];
  const override = workspace.override;

  return {
    callMinutes: {
      used: Number(currentUsage?.callMinutesUsed ?? 0),
      included: override?.customIncludedCallMinutes ?? planRegion.includedCallMinutes,
    },
    whatsappConversations: {
      used: currentUsage?.whatsappConversationsUsed ?? 0,
      included: override?.customIncludedWhatsappConversations ?? planRegion.includedWhatsappConversations,
    },
    seats: {
      used: workspace._count.members,
      included: planRegion.includedSeats ?? 999,
    },
    agents: {
      used: workspace._count.agents,
      included: planRegion.includedAgents ?? 999,
    },
    phoneNumbers: {
      used: workspace._count.phoneNumbers,
      included: planRegion.includedPhoneNumbers ?? 999,
    },
    periodStart: currentUsage?.periodStart,
    periodEnd: currentUsage?.periodEnd,
  };
}

