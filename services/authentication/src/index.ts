/**
 * Craftor Authentication Service Barrel Exports
 */

export * from './wordpress-auth.js';
export * from './token-manager.js';
export * from './capability-checker.js';
export * from './session.js';

// Legacy class export for backwards compatibility
import { computeSha256 } from '../../../packages/shared-utils/dist/index.js';

export class AuthenticationService {
  public static hashToken(rawToken: string): string {
    return computeSha256(rawToken);
  }

  public static verifyToken(rawToken: string, storedHash: string): boolean {
    return this.hashToken(rawToken) === storedHash;
  }
}
