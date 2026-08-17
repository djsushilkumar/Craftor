/**
 * Craftor License Quota & Tier Rate Limiting Enforcer
 * Enforces execution limits across Community, Pro, Agency, and Enterprise tiers.
 */

export type LicenseTier = 'community' | 'pro' | 'agency' | 'enterprise';

export interface TierQuotaLimits {
  tier: LicenseTier;
  monthlyToolCalls: number;
  maxSubsites: number;
  allowedConcurrentRequests: number;
  customBrandingAllowed: boolean;
  prioritySupport: boolean;
}

export const TIER_LIMITS: Record<LicenseTier, TierQuotaLimits> = {
  community: {
    tier: 'community',
    monthlyToolCalls: 1000,
    maxSubsites: 1,
    allowedConcurrentRequests: 2,
    customBrandingAllowed: false,
    prioritySupport: false,
  },
  pro: {
    tier: 'pro',
    monthlyToolCalls: 25000,
    maxSubsites: 5,
    allowedConcurrentRequests: 8,
    customBrandingAllowed: false,
    prioritySupport: true,
  },
  agency: {
    tier: 'agency',
    monthlyToolCalls: 150000,
    maxSubsites: 25,
    allowedConcurrentRequests: 20,
    customBrandingAllowed: true,
    prioritySupport: true,
  },
  enterprise: {
    tier: 'enterprise',
    monthlyToolCalls: Infinity,
    maxSubsites: Infinity,
    allowedConcurrentRequests: 100,
    customBrandingAllowed: true,
    prioritySupport: true,
  },
};

export class QuotaEnforcer {
  private currentUsage = 0;
  private readonly tierLimits: TierQuotaLimits;

  constructor(tier: LicenseTier = 'community') {
    this.tierLimits = TIER_LIMITS[tier] ?? TIER_LIMITS.community;
  }

  public checkQuota(requestedCalls = 1): { allowed: boolean; remainingCalls: number; currentUsage: number } {
    const isAllowed = this.currentUsage + requestedCalls <= this.tierLimits.monthlyToolCalls;
    if (isAllowed) {
      this.currentUsage += requestedCalls;
    }
    const remaining = Math.max(0, this.tierLimits.monthlyToolCalls - this.currentUsage);
    return {
      allowed: isAllowed,
      remainingCalls: remaining,
      currentUsage: this.currentUsage,
    };
  }

  public getTierLimits(): TierQuotaLimits {
    return { ...this.tierLimits };
  }
}
