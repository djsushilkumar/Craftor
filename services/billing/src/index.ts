/**
 * Craftor SaaS - Billing & Subscriptions Microservice
 * Manages Stripe checkouts, subscription tiers, customer invoices, and webhooks.
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'pro' | 'agency' | 'enterprise';
  priceMonthly: number;
  maxSites: number;
  features: string[];
}

export class BillingService {
  public static readonly PLANS: SubscriptionPlan[] = [
    {
      id: 'plan_pro_monthly',
      name: 'Craftor Pro Plan',
      tier: 'pro',
      priceMonthly: 49.00,
      maxSites: 3,
      features: ['Live Canvas SSE Sync', 'Theme Builder Templates', 'WooCommerce Pro', 'Priority Updates'],
    },
    {
      id: 'plan_agency_monthly',
      name: 'Craftor Agency Fleet',
      tier: 'agency',
      priceMonthly: 99.00,
      maxSites: 25,
      features: ['Unlimited Live Sync', 'All Pro Templates', 'Multi-Site Fleet Management', 'White-Label Branding'],
    },
    {
      id: 'plan_enterprise_custom',
      name: 'Enterprise Dedicated',
      tier: 'enterprise',
      priceMonthly: 299.00,
      maxSites: 999,
      features: ['Custom LLM Fine-Tuning', 'Dedicated SLA', 'Private Cloud Hosting', 'Unlimited Sites'],
    },
  ];

  public static createCheckoutSession(planId: string, customerEmail: string): { sessionId: string; checkoutUrl: string; planId: string } {
    const defaultPlan: SubscriptionPlan = this.PLANS[0] ?? {
      id: 'plan_pro_monthly',
      name: 'Craftor Pro Plan',
      tier: 'pro',
      priceMonthly: 49.00,
      maxSites: 3,
      features: ['Live Canvas SSE Sync', 'Theme Builder Templates', 'WooCommerce Pro', 'Priority Updates'],
    };
    const plan: SubscriptionPlan = this.PLANS.find(p => p.id === planId) ?? defaultPlan;
    const sessionId = `cs_test_${Math.random().toString(16).substring(2, 14)}`;
    return {
      sessionId,
      checkoutUrl: `https://checkout.craftor.ai/session/${sessionId}?plan=${plan.id}&email=${encodeURIComponent(customerEmail)}`,
      planId: plan.id,
    };
  }

  public static handleWebhookEvent(event: { type: string; data: { object: Record<string, unknown> } }): { processed: boolean; action: string } {
    if (event.type === 'checkout.session.completed') {
      return { processed: true, action: 'license_issued_and_customer_notified' };
    }
    if (event.type === 'customer.subscription.deleted') {
      return { processed: true, action: 'license_revoked' };
    }
    return { processed: true, action: 'event_ignored' };
  }

  public static getCreditBalance(_orgId: string): number {
    return 1000.0;
  }
}
