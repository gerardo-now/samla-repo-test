import { NextResponse } from 'next/server';

// Mock plans for when database is not configured
const mockPlans = [
  {
    code: "starter",
    name: "Inicial",
    description: "Perfecto para empezar",
    currency: "MXN",
    displayPriceMonthly: 499,
    quotas: {
      includedCallMinutes: 100,
      includedWhatsappConversations: 500,
      includedSeats: 2,
      includedAgents: 1,
      includedPhoneNumbers: 1,
    },
    overageRates: {
      callMinutePrice: 2.5,
      whatsappConversationPrice: 0.5,
    },
    limitMode: "soft",
  },
  {
    code: "growth",
    name: "Crecimiento",
    description: "Para equipos en crecimiento",
    currency: "MXN",
    displayPriceMonthly: 1499,
    quotas: {
      includedCallMinutes: 500,
      includedWhatsappConversations: 2000,
      includedSeats: 5,
      includedAgents: 3,
      includedPhoneNumbers: 2,
    },
    overageRates: {
      callMinutePrice: 2.0,
      whatsappConversationPrice: 0.4,
    },
    limitMode: "soft",
  },
  {
    code: "pro",
    name: "Profesional",
    description: "Para empresas establecidas",
    currency: "MXN",
    displayPriceMonthly: 3999,
    quotas: {
      includedCallMinutes: 2000,
      includedWhatsappConversations: 10000,
      includedSeats: 15,
      includedAgents: 10,
      includedPhoneNumbers: 5,
    },
    overageRates: {
      callMinutePrice: 1.5,
      whatsappConversationPrice: 0.3,
    },
    limitMode: "soft",
  },
];

export async function GET() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        regionCode: "LATAM",
        plans: mockPlans,
        _note: "Using mock data - database not configured",
      });
    }

    // Try to use auth and database
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { db } = await import('@/lib/db');
      
      const { userId } = await auth();

      if (!userId) {
        // Return mock plans for unauthenticated users
        return NextResponse.json({
          regionCode: "LATAM",
          plans: mockPlans,
        });
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
        return NextResponse.json({
          regionCode: "LATAM",
          plans: mockPlans,
        });
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

      if (planRegions.length === 0) {
        return NextResponse.json({
          regionCode,
          plans: mockPlans,
        });
      }

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
    } catch {
      // If Clerk/DB fails, return mock plans
      return NextResponse.json({
        regionCode: "LATAM",
        plans: mockPlans,
      });
    }
  } catch (error) {
    console.error('Error fetching available plans:', error);
    return NextResponse.json({
      regionCode: "LATAM",
      plans: mockPlans,
      _error: "Fallback to mock data",
    });
  }
}
