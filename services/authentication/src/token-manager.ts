/**
 * Craftor Token Manager
 * Secure token generation, AES-256-GCM vault encryption, expiration, rotation, and revocation.
 */

import * as crypto from 'crypto';
import {
  computeSha256,
  encryptAes256,
  decryptAes256,
  AesEncryptedPayload,
  constantTimeCompare,
} from '../../../packages/shared-utils/dist/index.js';
import { AUTH_ERROR_CODES, WordPressSecurityError } from './wordpress-auth.js';

export interface ManagedToken {
  id: string;
  tokenHash: string;
  userId: string;
  role: string;
  createdAt: number;
  expiresAt: number;
  lastUsedAt?: number;
  revoked: boolean;
  revokedReason?: string;
  metadata?: Record<string, unknown>;
}

export interface TokenManagerOptions {
  defaultTtlMs?: number;
  tokenPrefix?: string;
}

export class TokenManager {
  private readonly defaultTtlMs: number;
  private readonly tokenPrefix: string;
  private readonly tokensByHash = new Map<string, ManagedToken>();

  constructor(options: TokenManagerOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 24 * 60 * 60 * 1000; // 24 hours
    this.tokenPrefix = options.tokenPrefix ?? 'crf_live_';
  }

  /**
   * Generates a high-entropy cryptographically secure token and stores its SHA-256 hash.
   */
  public generateToken(
    userId: string,
    role: string = 'administrator',
    ttlMs?: number,
    metadata?: Record<string, unknown>,
  ): { rawToken: string; managedToken: ManagedToken } {
    if (!userId || !userId.trim()) {
      throw new Error('UserId must be specified when generating token.');
    }

    const entropy = crypto.randomBytes(32).toString('hex');
    const rawToken = `${this.tokenPrefix}${entropy}`;
    const tokenHash = computeSha256(rawToken);
    const now = Date.now();
    const expiresAt = now + (ttlMs ?? this.defaultTtlMs);

    const managedToken: ManagedToken = {
      id: crypto.randomUUID(),
      tokenHash,
      userId: userId.trim(),
      role,
      createdAt: now,
      expiresAt,
      revoked: false,
      metadata: metadata ? { ...metadata } : undefined,
    };

    this.tokensByHash.set(tokenHash, managedToken);
    return { rawToken, managedToken: { ...managedToken } };
  }

  /**
   * Validates a raw token against the stored SHA-256 hash, verifying non-revocation and non-expiration.
   */
  public validateToken(rawToken: string): ManagedToken {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.INVALID_TOKEN,
        'INVALID_TOKEN',
        'Raw token must be a non-empty string.',
      );
    }

    const tokenHash = computeSha256(rawToken);
    const token = this.tokensByHash.get(tokenHash);

    if (!token) {
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.INVALID_TOKEN,
        'INVALID_TOKEN',
        'Token not found or unrecognized.',
      );
    }

    if (token.revoked) {
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.INVALID_TOKEN,
        'INVALID_TOKEN',
        `Token has been revoked: ${token.revokedReason ?? 'No reason specified'}.`,
      );
    }

    const now = Date.now();
    if (token.expiresAt <= now) {
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.EXPIRED_SESSION,
        'EXPIRED_SESSION',
        `Token expired at ${new Date(token.expiresAt).toISOString()}.`,
      );
    }

    // Touch last used timestamp
    token.lastUsedAt = now;
    return { ...token };
  }

  /**
   * Rotates a token by invalidating the old token and issuing a brand new active token.
   */
  public rotateToken(
    oldRawToken: string,
    newTtlMs?: number,
  ): { rawToken: string; managedToken: ManagedToken } {
    const existing = this.validateToken(oldRawToken);

    // Invalidate old token
    this.revokeToken(oldRawToken, 'Rotated to new token');

    // Generate replacement token
    return this.generateToken(
      existing.userId,
      existing.role,
      newTtlMs ?? existing.expiresAt - existing.createdAt,
      existing.metadata,
    );
  }

  /**
   * Revokes a specific token immediately.
   */
  public revokeToken(rawToken: string, reason: string = 'Manual revocation'): void {
    const tokenHash = computeSha256(rawToken);
    const token = this.tokensByHash.get(tokenHash);
    if (token) {
      token.revoked = true;
      token.revokedReason = reason;
    }
  }

  /**
   * Revokes all active tokens belonging to a specific user.
   */
  public revokeAllUserTokens(userId: string, reason: string = 'Revoke all user tokens'): number {
    let count = 0;
    for (const token of this.tokensByHash.values()) {
      if (token.userId === userId && !token.revoked) {
        token.revoked = true;
        token.revokedReason = reason;
        count++;
      }
    }
    return count;
  }

  /**
   * Encrypts a sensitive token or secret using AES-256-GCM.
   */
  public encryptSecret(plaintext: string, secretKeyHex: string): AesEncryptedPayload {
    return encryptAes256(plaintext, secretKeyHex);
  }

  /**
   * Decrypts an AES-256-GCM encrypted token or secret.
   */
  public decryptSecret(encrypted: AesEncryptedPayload | string, secretKeyHex: string): string {
    return decryptAes256(encrypted, secretKeyHex);
  }

  /**
   * Performs constant-time comparison on two secret tokens.
   */
  public verifyConstantTime(a: string, b: string): boolean {
    return constantTimeCompare(a, b);
  }

  /**
   * Cleans up expired and revoked tokens from memory.
   */
  public cleanupExpiredTokens(): number {
    const now = Date.now();
    let removed = 0;
    for (const [hash, token] of this.tokensByHash.entries()) {
      if (token.expiresAt <= now || token.revoked) {
        this.tokensByHash.delete(hash);
        removed++;
      }
    }
    return removed;
  }

  public getManagedTokens(): ManagedToken[] {
    return Array.from(this.tokensByHash.values()).map((t) => ({ ...t }));
  }
}
