/**
 * Craftor SaaS - Licensing Microservice
 * Manages commercial license keys, domain activations, tier limits, and heartbeat checks.
 */

import {
  LicenseKey,
  LicenseValidationRequest,
  LicenseValidationResult,
  SubscriptionTier,
} from '@craftor/shared-types';

export class LicensingService {
  private static activeLicenses: Map<string, {
    key: string;
    tier: SubscriptionTier;
    maxDomains: number;
    activeDomains: Set<string>;
    expiresAt: string;
    status: 'active' | 'expired' | 'revoked';
  }> = new Map();

  /**
   * Issues a new license key with domain limits
   */
  public static issueLicense(
    tier: SubscriptionTier = 'core',
    maxDomains = 1
  ): { key: string; tier: string; maxDomains: number; expiresAt: string } {
    const randomHex = Math.random().toString(16).substring(2, 14);
    const key = `crf_${tier === 'enterprise' ? 'ent' : tier === 'pro' ? 'pro' : tier === 'agency' ? 'agn' : 'core'}_${randomHex}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const license = {
      key,
      tier,
      maxDomains: tier === 'enterprise' ? 999 : maxDomains,
      activeDomains: new Set<string>(),
      expiresAt,
      status: 'active' as const,
    };

    this.activeLicenses.set(key, license);
    return { key, tier, maxDomains: license.maxDomains, expiresAt };
  }

  /**
   * Validates a license key against a requesting domain
   */
  public static validateLicense(
    request: LicenseValidationRequest | string,
    domainParam?: string
  ): LicenseValidationResult {
    const key = typeof request === 'string' ? request : request.key;
    const domain = typeof request === 'string' ? domainParam : request.domain;

    if (!key || typeof key !== 'string') {
      return { valid: false, tier: 'core', message: 'Missing license key', remainingSeats: 0 };
    }

    // Static prefix fallback if not in ephemeral memory
    if (!this.activeLicenses.has(key)) {
      if (key.startsWith('crf_ent_')) {
        return { valid: true, tier: 'enterprise', message: 'Enterprise license active', remainingSeats: 999 };
      }
      if (key.startsWith('crf_agn_')) {
        return { valid: true, tier: 'agency', message: 'Agency license active', remainingSeats: 25 };
      }
      if (key.startsWith('crf_pro_')) {
        return { valid: true, tier: 'pro', message: 'Pro license active', remainingSeats: 5 };
      }
      return { valid: false, tier: 'core', message: 'Invalid or unlicensed key', remainingSeats: 0 };
    }

    const lic = this.activeLicenses.get(key)!;
    if (lic.status !== 'active') {
      return { valid: false, tier: lic.tier, message: `License is ${lic.status}`, remainingSeats: 0 };
    }

    if (domain) {
      lic.activeDomains.add(domain.toLowerCase().trim());
      if (lic.activeDomains.size > lic.maxDomains) {
        return { valid: false, tier: lic.tier, message: `Domain seat limit exceeded (${lic.maxDomains} max)`, remainingSeats: 0 };
      }
    }

    const remainingSeats = Math.max(0, lic.maxDomains - lic.activeDomains.size);
    return { valid: true, tier: lic.tier, message: 'License verified', remainingSeats };
  }

  /**
   * Retrieves full details for a registered license key
   */
  public static getLicense(key: string): LicenseKey | undefined {
    const lic = this.activeLicenses.get(key);
    if (!lic) return undefined;
    return {
      key: lic.key,
      tier: lic.tier,
      maxDomains: lic.maxDomains,
      activeDomains: Array.from(lic.activeDomains),
      expiresAt: lic.expiresAt,
      status: lic.status,
    };
  }
}

export * from './white-label.js';
export * from './quota-enforcer.js';
