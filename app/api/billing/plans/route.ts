import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user's workspace to determine region
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ error: 'Espacio de trabajo no encontrado' }, { status: 404 });
    }

    const workspace = user.memberships[0].workspace;
    const regionCode = workspace.billingRegion;

    // Get all active plans with region-specific pricing
    const planRegions = await db.planRegion.findMany({
      where: {
        regionCode,
        isActive: true,
        plan: {
          isPublic: true,
          isActive: true,
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        plan: {
          sortOrder: 'asc',
        },
      },
    });

    const plans = planRegions.map((pr) => ({
      code: pr.plan.code,
      name: pr.plan.name,
      description: pr.plan.description,
      currency: pr.currency,
      displayPriceMonthly: pr.displayPriceMonthly,
      stripePriceId: pr.stripePriceId,
      quotas: {
        includedCallMinutes: pr.includedCallMinutes,
        includedWhatsappConversations: pr.includedWhatsappConversations,
        includedSeats: pr.includedSeats,
        includedAgents: pr.includedAgents,
        includedPhoneNumbers: pr.includedPhoneNumbers,
      },
      overageRates: {
        callMinutePrice: pr.overageCallMinutePrice,
        whatsappConversationPrice: pr.overageWhatsappConversationPrice,
      },
      limitMode: pr.limitMode,
    }));

    return NextResponse.json({
      regionCode,
      plans,
    });
  } catch (error) {
    console.error('Error fetching available plans:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

