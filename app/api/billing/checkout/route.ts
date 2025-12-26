import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { billingProvider } from '@/lib/providers/billingProvider';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { planCode } = body;

    if (!planCode) {
      return NextResponse.json({ error: 'Plan requerido' }, { status: 400 });
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
    const regionCode = workspace.billingRegion;

    // Get plan region to find Stripe price ID
    const planRegion = await db.planRegion.findFirst({
      where: {
        plan: { code: planCode },
        regionCode,
        isActive: true,
      },
      include: {
        plan: true,
      },
    });

    if (!planRegion || !planRegion.stripePriceId) {
      return NextResponse.json({ error: 'Plan no disponible en tu región' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await billingProvider.createCheckoutSession({
      workspaceId: workspace.id,
      planCode,
      regionCode,
      priceId: planRegion.stripePriceId,
      customerId: workspace.subscription?.stripeCustomerId || undefined,
      customerEmail: user.email,
      successUrl: `${appUrl}/settings?tab=billing&success=true`,
      cancelUrl: `${appUrl}/settings?tab=billing&cancelled=true`,
    });

    if (!session) {
      return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

