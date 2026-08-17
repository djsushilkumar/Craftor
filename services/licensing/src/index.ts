export class LicensingService {
  public static validateLicense(key: string): { valid: boolean; tier: string } {
    if (key.startsWith('crf_ent_')) {
      return { valid: true, tier: 'enterprise' };
    }
    if (key.startsWith('crf_pro_')) {
      return { valid: true, tier: 'pro' };
    }
    return { valid: true, tier: 'core' };
  }
}

export * from './white-label.js';
export * from './quota-enforcer.js';

