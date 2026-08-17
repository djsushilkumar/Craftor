/**
 * Craftor Authentication Session Manager
 * Manages active user sessions, TTLs, activity heartbeats, and lifecycle destruction.
 */

import * as crypto from 'crypto';
import { AUTH_ERROR_CODES, WordPressSecurityError } from './wordpress-auth.js';
import { AuthenticatedUser } from './capability-checker.js';

export interface AuthSession {
  sessionId: string;
  user: AuthenticatedUser;
  createdAt: number;
  expiresAt: number;
  lastActiveAt: number;
  metadata?: Record<string, unknown>;
}

export interface SessionManagerOptions {
  defaultTtlMs?: number;
}

export class SessionManager {
  private readonly defaultTtlMs: number;
  private readonly sessions = new Map<string, AuthSession>();

  constructor(options: SessionManagerOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 2 * 60 * 60 * 1000; // 2 hours default
  }

  /**
   * Creates a new authenticated session for a user.
   */
  public createSession(
    user: AuthenticatedUser,
    ttlMs?: number,
    metadata?: Record<string, unknown>,
  ): AuthSession {
    if (!user || !user.id) {
      throw new Error('User context required to create an authentication session.');
    }

    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + (ttlMs ?? this.defaultTtlMs);

    const session: AuthSession = {
      sessionId,
      user: { ...user },
      createdAt: now,
      expiresAt,
      lastActiveAt: now,
      metadata: metadata ? { ...metadata } : undefined,
    };

    this.sessions.set(sessionId, session);
    return { ...session };
  }

  /**
   * Validates an existing session and updates its lastActiveAt timestamp.
   */
  public validateSession(sessionId: string): AuthSession {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.INVALID_TOKEN,
        'INVALID_SESSION_ID',
        'Session ID must be a non-empty string.',
      );
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.UNAUTHORIZED,
        'SESSION_NOT_FOUND',
        'Session does not exist or has already been terminated.',
      );
    }

    const now = Date.now();
    if (session.expiresAt <= now) {
      this.sessions.delete(sessionId);
      throw new WordPressSecurityError(
        AUTH_ERROR_CODES.EXPIRED_SESSION,
        'EXPIRED_SESSION',
        `Session ${sessionId} expired at ${new Date(session.expiresAt).toISOString()}.`,
      );
    }

    session.lastActiveAt = now;
    return { ...session };
  }

  /**
   * Extends the lifespan of an active session.
   */
  public touchSession(sessionId: string, additionalTtlMs?: number): AuthSession {
    const session = this.validateSession(sessionId);
    const ttl = additionalTtlMs ?? this.defaultTtlMs;
    session.expiresAt = Date.now() + ttl;
    this.sessions.set(sessionId, session);
    return { ...session };
  }

  /**
   * Explicitly expires a session immediately.
   */
  public expireSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.expiresAt = Date.now() - 1000;
    }
  }

  /**
   * Destroys and removes a session from memory.
   */
  public destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Destroys all active sessions for a specific user ID.
   */
  public destroyAllUserSessions(userId: string | number): number {
    let count = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.user.id === userId) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  /**
   * Returns all active, unexpired sessions.
   */
  public getActiveSessions(): AuthSession[] {
    const now = Date.now();
    const active: AuthSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.expiresAt > now) {
        active.push({ ...session });
      }
    }
    return active;
  }

  /**
   * Cleans up expired sessions.
   */
  public cleanupExpiredSessions(): number {
    const now = Date.now();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }
}
