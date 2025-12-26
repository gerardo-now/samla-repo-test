import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { billingProvider } from '@/lib/providers/billingProvider';

export async function POST() {
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

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create portal session
    const session = await billingProvider.createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${appUrl}/settings?tab=billing`,
    });

    if (!session) {
      return NextResponse.json({ error: 'Error al crear sesión de portal' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

