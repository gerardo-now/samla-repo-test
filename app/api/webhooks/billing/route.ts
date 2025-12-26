import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { billingProvider } from '@/lib/providers/billingProvider';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = billingProvider.constructWebhookEvent(body, signature);

    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const workspaceId = session.metadata?.workspaceId;
  const planCode = session.metadata?.planCode;
  const regionCode = session.metadata?.regionCode;

  if (!workspaceId || !planCode || !regionCode) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Update or create workspace subscription
  await db.workspaceSubscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      planCode,
      regionCode,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
    },
    update: {
      planCode,
      regionCode,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'ACTIVE',
    },
  });

  // Log billing event
  await db.billingEvent.create({
    data: {
      workspaceId,
      type: 'SUBSCRIPTION_CREATED',
      payloadJson: {
        sessionId: session.id,
        customerId,
        subscriptionId,
        planCode,
        regionCode,
      },
    },
  });

  // Update onboarding checklist
  await db.onboardingChecklist.update({
    where: { workspaceId },
    data: { billingConfigured: true },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const workspaceSub = await db.workspaceSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!workspaceSub) {
    console.error('Workspace subscription not found for:', subscription.id);
    return;
  }

  const statusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING'> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    unpaid: 'INACTIVE',
    trialing: 'TRIALING',
    incomplete: 'INACTIVE',
    incomplete_expired: 'INACTIVE',
    paused: 'INACTIVE',
  };

  // Access subscription data with type safety
  const subData = subscription as unknown as {
    status: string;
    items: { data: Array<{ price: { id: string } }> };
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };

  await db.workspaceSubscription.update({
    where: { id: workspaceSub.id },
    data: {
      status: statusMap[subData.status] || 'INACTIVE',
      stripePriceId: subData.items.data[0]?.price.id,
      currentPeriodStart: new Date(subData.current_period_start * 1000),
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
      cancelAtPeriodEnd: subData.cancel_at_period_end,
    },
  });

  // Log billing event
  await db.billingEvent.create({
    data: {
      workspaceId: workspaceSub.workspaceId,
      type: 'SUBSCRIPTION_UPDATED',
      payloadJson: {
        subscriptionId: subscription.id,
        status: subData.status,
        currentPeriodEnd: subData.current_period_end,
      },
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const workspaceSub = await db.workspaceSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!workspaceSub) {
    return;
  }

  await db.workspaceSubscription.update({
    where: { id: workspaceSub.id },
    data: {
      status: 'CANCELLED',
    },
  });

  // Log billing event
  await db.billingEvent.create({
    data: {
      workspaceId: workspaceSub.workspaceId,
      type: 'SUBSCRIPTION_CANCELLED',
      payloadJson: {
        subscriptionId: subscription.id,
        cancelledAt: new Date().toISOString(),
      },
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Access invoice data with type safety
  const invData = invoice as unknown as {
    id: string;
    subscription?: string;
    period_start?: number;
    period_end?: number;
  };
  
  const subscriptionId = invData.subscription;
  if (!subscriptionId) return;

  const workspaceSub = await db.workspaceSubscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!workspaceSub) {
    return;
  }

  // Reset usage for new billing period
  const periodStart = invData.period_start ? new Date(invData.period_start * 1000) : new Date();
  const periodEnd = invData.period_end ? new Date(invData.period_end * 1000) : new Date();

  await db.workspaceUsageMonthly.upsert({
    where: {
      workspaceId_periodStart: {
        workspaceId: workspaceSub.workspaceId,
        periodStart,
      },
    },
    create: {
      workspaceId: workspaceSub.workspaceId,
      periodStart,
      periodEnd,
      callMinutesUsed: 0,
      whatsappConversationsUsed: 0,
      seatsUsed: 0,
      agentsUsed: 0,
      phoneNumbersUsed: 0,
    },
    update: {},
  });

  // Log billing event
  await db.billingEvent.create({
    data: {
      workspaceId: workspaceSub.workspaceId,
      type: 'QUOTA_RESET',
      payloadJson: {
        invoiceId: invoice.id,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Access invoice data with type safety
  const invData = invoice as unknown as {
    id: string;
    subscription?: string;
  };
  
  const subscriptionId = invData.subscription;
  if (!subscriptionId) return;

  const workspaceSub = await db.workspaceSubscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!workspaceSub) {
    return;
  }

  await db.workspaceSubscription.update({
    where: { id: workspaceSub.id },
    data: {
      status: 'PAST_DUE',
    },
  });

  // Log billing event
  await db.billingEvent.create({
    data: {
      workspaceId: workspaceSub.workspaceId,
      type: 'STRIPE_WEBHOOK',
      payloadJson: {
        type: 'invoice.payment_failed',
        invoiceId: invoice.id,
      },
    },
  });
}

