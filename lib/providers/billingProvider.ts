/**
 * Billing Provider Abstraction
 * 
 * INTERNAL ONLY - Provider name must NEVER appear in UI
 * All billing/payment functionality is routed through this abstraction
 */

import Stripe from 'stripe';

interface CheckoutSessionOptions {
  workspaceId: string;
  planCode: string;
  regionCode: string;
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

interface PortalSessionOptions {
  customerId: string;
  returnUrl: string;
}

interface PortalSessionResult {
  url: string;
}

interface CustomerCreateOptions {
  email: string;
  name?: string;
  workspaceId: string;
  metadata?: Record<string, string>;
}

interface SubscriptionInfo {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

interface InvoiceItemOptions {
  customerId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

class BillingProvider {
  private _stripe: Stripe | null = null;
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.BILLING_WEBHOOK_SECRET || '';
  }

  private get stripe(): Stripe {
    if (!this._stripe) {
      const apiKey = process.env.BILLING_SECRET_KEY;
      if (!apiKey) {
        throw new Error('Billing API key not configured');
      }
      this._stripe = new Stripe(apiKey, {
        apiVersion: '2025-12-15.clover',
      });
    }
    return this._stripe;
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult | null> {
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        line_items: [
          {
            price: options.priceId,
            quantity: 1,
          },
        ],
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        metadata: {
          workspaceId: options.workspaceId,
          planCode: options.planCode,
          regionCode: options.regionCode,
        },
      };

      if (options.customerId) {
        sessionParams.customer = options.customerId;
      } else if (options.customerEmail) {
        sessionParams.customer_email = options.customerEmail;
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  async createPortalSession(options: PortalSessionOptions): Promise<PortalSessionResult | null> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: options.customerId,
        return_url: options.returnUrl,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return null;
    }
  }

  async createCustomer(options: CustomerCreateOptions): Promise<string | null> {
    try {
      const customer = await this.stripe.customers.create({
        email: options.email,
        name: options.name,
        metadata: {
          workspaceId: options.workspaceId,
          ...options.metadata,
        },
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      // Access subscription data with proper typing
      const subData = subscription as unknown as {
        id: string;
        customer: string;
        items: { data: Array<{ price: { id: string } }> };
        status: string;
        current_period_start: number;
        current_period_end: number;
        cancel_at_period_end: boolean;
      };

      return {
        subscriptionId: subData.id,
        customerId: subData.customer,
        priceId: subData.items.data[0]?.price.id || '',
        status: subData.status as SubscriptionInfo['status'],
        currentPeriodStart: new Date(subData.current_period_start * 1000),
        currentPeriodEnd: new Date(subData.current_period_end * 1000),
        cancelAtPeriodEnd: subData.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<boolean> {
    try {
      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  async addInvoiceItem(options: InvoiceItemOptions): Promise<boolean> {
    try {
      await this.stripe.invoiceItems.create({
        customer: options.customerId,
        amount: Math.round(options.amount * 100), // Convert to cents
        currency: options.currency.toLowerCase(),
        description: options.description,
        metadata: options.metadata,
      });
      return true;
    } catch (error) {
      console.error('Error adding invoice item:', error);
      return false;
    }
  }

  async getPrice(priceId: string): Promise<Stripe.Price | null> {
    try {
      return await this.stripe.prices.retrieve(priceId);
    } catch (error) {
      console.error('Error getting price:', error);
      return null;
    }
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event | null {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      return null;
    }
  }
}

export const billingProvider = new BillingProvider();
export type {
  CheckoutSessionOptions,
  CheckoutSessionResult,
  PortalSessionOptions,
  PortalSessionResult,
  CustomerCreateOptions,
  SubscriptionInfo,
  InvoiceItemOptions,
};

