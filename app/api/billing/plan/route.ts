import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user's workspace
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                subscription: true,
                usageMonthly: {
                  orderBy: { periodStart: 'desc' },
                  take: 1,
                },
                override: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ error: 'Espacio de trabajo no encontrado' }, { status: 404 });
    }

    const workspace = user.memberships[0].workspace;
    const subscription = workspace.subscription;
    const currentUsage = workspace.usageMonthly[0];
    const override = workspace.override;

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        workspaceId: workspace.id,
        billingRegion: workspace.billingRegion,
      });
    }

    // Get plan details
    const planRegion = await db.planRegion.findFirst({
      where: {
        plan: { code: subscription.planCode },
        regionCode: subscription.regionCode,
        isActive: true,
      },
      include: {
        plan: true,
      },
    });

    if (!planRegion) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    // Apply overrides if present
    const includedCallMinutes = override?.customIncludedCallMinutes ?? planRegion.includedCallMinutes;
    const includedWhatsappConversations = override?.customIncludedWhatsappConversations ?? planRegion.includedWhatsappConversations;

    return NextResponse.json({
      hasSubscription: true,
      workspaceId: workspace.id,
      plan: {
        code: subscription.planCode,
        name: planRegion.plan.name,
        regionCode: subscription.regionCode,
        currency: planRegion.currency,
        displayPriceMonthly: planRegion.displayPriceMonthly,
      },
      quotas: {
        includedCallMinutes,
        includedWhatsappConversations,
        includedSeats: planRegion.includedSeats,
        includedAgents: planRegion.includedAgents,
        limitMode: override?.customLimitMode ?? planRegion.limitMode,
      },
      usage: currentUsage ? {
        callMinutesUsed: currentUsage.callMinutesUsed,
        whatsappConversationsUsed: currentUsage.whatsappConversationsUsed,
        seatsUsed: currentUsage.seatsUsed,
        agentsUsed: currentUsage.agentsUsed,
        periodStart: currentUsage.periodStart,
        periodEnd: currentUsage.periodEnd,
      } : null,
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      hasOverride: !!override?.isActive,
    });
  } catch (error) {
    console.error('Error fetching billing plan:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

