/**
 * Craftor Licensing & Subscription Contracts
 */

export type SubscriptionTier = 'core' | 'community' | 'pro' | 'agency' | 'enterprise';

export interface LicenseKey {
  key: string;
  tier: SubscriptionTier;
  maxDomains: number;
  activeDomains?: string[];
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface LicenseValidationRequest {
  key: string;
  domain?: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  tier: string;
  message: string;
  remainingSeats: number;
}
