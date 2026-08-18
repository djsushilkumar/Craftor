/**
 * Craftor Ephemeral Confirmation Manager
 * Enforces cryptographic, time-bound (TTL 300s), single-use challenge tokens
 * for all destructive operations across the Craftor MCP Platform.
 */

import { randomBytes } from 'crypto';

export interface ConfirmationChallenge {
  requiresConfirmation: true;
  action: string;
  targetId: string | number;
  confirmationToken: string;
  expiresInSeconds: number;
  message: string;
}

interface StoredChallenge {
  action: string;
  targetId: string | number;
  token: string;
  expiresAt: number; // Unix timestamp in milliseconds
  consumed: boolean;
}

export class ConfirmationManager {
  private static challenges: Map<string, StoredChallenge> = new Map();
  private static readonly DEFAULT_TTL_SECONDS = 300; // 5 minutes

  /**
   * Generates and stores an ephemeral, single-use confirmation challenge.
   *
   * @param action The destructive tool name (e.g. 'craftor_wp_delete_post')
   * @param targetId The ID of the affected resource (post, product, snapshot, or plugin file)
   * @param ttlSeconds Lifetime of the challenge in seconds (default: 300s)
   */
  public static issueChallenge(
    action: string,
    targetId: string | number,
    ttlSeconds: number = ConfirmationManager.DEFAULT_TTL_SECONDS,
  ): ConfirmationChallenge {
    // Generate cryptographically secure random token
    const token = `crf_cfm_${randomBytes(16).toString('hex')}`;
    const expiresAt = Date.now() + ttlSeconds * 1000;

    const challengeRecord: StoredChallenge = {
      action,
      targetId,
      token,
      expiresAt,
      consumed: false,
    };

    // Index by token for O(1) lookup
    this.challenges.set(token, challengeRecord);

    // Clean up expired tokens periodically
    this.purgeExpired();

    return {
      requiresConfirmation: true,
      action,
      targetId,
      confirmationToken: token,
      expiresInSeconds: ttlSeconds,
      message: `[DESTRUCTIVE OPERATION] Action "${action}" on resource "${targetId}" requires explicit human confirmation. To proceed, supply the single-use confirmationToken: "${token}" within ${ttlSeconds} seconds.`,
    };
  }

  /**
   * Verifies and atomically consumes a confirmation token.
   * Enforces:
   * 1. Token existence
   * 2. Single-use (not consumed previously)
   * 3. Timestamp validity (not expired)
   * 4. Strict binding to action and targetId
   *
   * @param action The requested action
   * @param targetId The target resource ID
   * @param token The token provided by the caller
   * @return true if valid and consumed; false otherwise
   */
  public static verifyAndConsume(
    action: string,
    targetId: string | number,
    token: unknown,
  ): boolean {
    if (!token || typeof token !== 'string' || !token.startsWith('crf_cfm_')) {
      return false;
    }

    const record = this.challenges.get(token);
    if (!record) {
      return false; // Token does not exist
    }

    // Check if already consumed (Replay prevention)
    if (record.consumed) {
      this.challenges.delete(token);
      return false;
    }

    // Check expiration (TTL)
    if (Date.now() > record.expiresAt) {
      this.challenges.delete(token);
      return false;
    }

    // Verify action and targetId match exactly
    const isActionMatch = record.action === action;
    const isTargetMatch = String(record.targetId) === String(targetId);

    if (!isActionMatch || !isTargetMatch) {
      return false;
    }

    // Atomically burn the token so it can never be reused
    record.consumed = true;
    this.challenges.delete(token);
    return true;
  }

  /**
   * Purges all expired challenges from the in-memory registry.
   */
  private static purgeExpired(): void {
    const now = Date.now();
    for (const [token, record] of this.challenges.entries()) {
      if (now > record.expiresAt || record.consumed) {
        this.challenges.delete(token);
      }
    }
  }

  /**
   * Resets all challenges (used for test isolation).
   */
  public static reset(): void {
    this.challenges.clear();
  }
}
