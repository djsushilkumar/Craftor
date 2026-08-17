/**
 * Craftor WordPress Authentication Strategies & Cryptographic Security
 * Supports Application Passwords, Bearer Tokens, JWT Verification, and WordPress Nonces.
 */

import * as crypto from 'crypto';
import { constantTimeCompare } from '../../../packages/shared-utils/dist/index.js';

export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: -32001,
  FORBIDDEN_CAPABILITY: -32002,
  INVALID_TOKEN: -32003,
  EXPIRED_SESSION: -32004,
  NONCE_VALIDATION_FAILED: -32005,
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export class WordPressSecurityError extends Error {
  public readonly code: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(code: number, errorCode: string, message: string, details?: unknown) {
    super(message);
    this.name = 'WordPressSecurityError';
    this.code = code;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export interface JwtPayload {
  sub: string;
  role: string;
  iss?: string;
  aud?: string;
  exp: number;
  iat: number;
  capabilities?: string[];
  [key: string]: unknown;
}

/**
 * Validates Application Password credentials using constant-time comparison.
 */
export function verifyApplicationPassword(
  providedUser: string,
  providedPass: string,
  expectedUser: string,
  expectedPass: string,
): boolean {
  if (!providedUser || !providedPass || !expectedUser || !expectedPass) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.UNAUTHORIZED,
      'UNAUTHORIZED',
      'Missing or empty Application Password credentials.',
    );
  }

  const cleanProvidedPass = providedPass.replace(/\s+/g, '');
  const cleanExpectedPass = expectedPass.replace(/\s+/g, '');

  const userMatch = constantTimeCompare(providedUser, expectedUser);
  const passMatch = constantTimeCompare(cleanProvidedPass, cleanExpectedPass);

  if (!userMatch || !passMatch) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.UNAUTHORIZED,
      'UNAUTHORIZED',
      'Invalid Application Password username or secret.',
    );
  }

  return true;
}

/**
 * Validates a Bearer token header against the expected active token using constant-time comparison.
 */
export function verifyBearerToken(providedHeader: string, expectedToken: string): boolean {
  if (!providedHeader || !expectedToken) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'Missing Authorization Bearer token.',
    );
  }

  const parts = providedHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'Malformed Bearer authorization header format. Expected "Bearer <token>".',
    );
  }

  const token = parts[1] ?? '';
  if (!constantTimeCompare(token, expectedToken.trim())) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'Bearer token mismatch or revoked.',
    );
  }

  return true;
}

/**
 * Base64URL encoder helper.
 */
function base64UrlEncode(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decoder helper.
 */
function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Generates an HMAC SHA-256 signed JSON Web Token (JWT).
 */
export function createJwt(
  payload: { sub: string; role: string; [key: string]: unknown },
  secret: string,
  expiresInSeconds: number = 3600,
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    sub: payload.sub,
    role: payload.role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a JWT token signature and expiry using constant-time cryptographic checks.
 */
export function verifyJwt(token: string, secret: string): JwtPayload {
  if (!token || typeof token !== 'string') {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'JWT token must be a non-empty string.',
    );
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'Malformed JWT structure. Expected 3 segments.',
    );
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts as [string, string, string];
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest();
  const expectedEncodedSig = base64UrlEncode(expectedSignature);

  if (!constantTimeCompare(encodedSignature, expectedEncodedSig)) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'JWT signature verification failed.',
    );
  }

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
  } catch (err) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'INVALID_TOKEN',
      'Failed to parse JWT payload JSON.',
      err,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.EXPIRED_SESSION,
      'EXPIRED_SESSION',
      `JWT has expired at timestamp ${payload.exp} (current time: ${now}).`,
    );
  }

  return payload;
}

/**
 * Calculates a WordPress 12-hour nonce tick window.
 */
export function getWordPressNonceTick(timestampMs: number = Date.now(), windowSeconds: number = 43200): number {
  const seconds = Math.floor(timestampMs / 1000);
  return Math.ceil(seconds / (windowSeconds / 2));
}

/**
 * Generates a WordPress-compatible cryptographic nonce.
 */
export function createWordPressNonce(
  action: string,
  userId: string | number,
  secret: string,
  timestampMs: number = Date.now(),
): string {
  const tick = getWordPressNonceTick(timestampMs);
  const data = `${action}|${userId}|${tick}`;
  const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return hash.slice(-12, -2); // 10-char nonce matching WordPress token slice
}

/**
 * Verifies a WordPress nonce against current (0-12h) and previous (12-24h) tick windows with constant-time equality.
 * Returns 1 if valid in current window, 2 if valid in previous window, throws -32005 otherwise.
 */
export function verifyWordPressNonce(
  nonce: string,
  action: string,
  userId: string | number,
  secret: string,
  timestampMs: number = Date.now(),
): 1 | 2 {
  if (!nonce || typeof nonce !== 'string') {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.NONCE_VALIDATION_FAILED,
      'NONCE_VALIDATION_FAILED',
      'WordPress nonce must not be empty.',
    );
  }

  const currentTick = getWordPressNonceTick(timestampMs);
  const currentData = `${action}|${userId}|${currentTick}`;
  const currentHash = crypto.createHmac('sha256', secret).update(currentData).digest('hex').slice(-12, -2);

  if (constantTimeCompare(nonce, currentHash)) {
    return 1;
  }

  const prevTick = currentTick - 1;
  const prevData = `${action}|${userId}|${prevTick}`;
  const prevHash = crypto.createHmac('sha256', secret).update(prevData).digest('hex').slice(-12, -2);

  if (constantTimeCompare(nonce, prevHash)) {
    return 2;
  }

  throw new WordPressSecurityError(
    AUTH_ERROR_CODES.NONCE_VALIDATION_FAILED,
    'NONCE_VALIDATION_FAILED',
    `WordPress nonce validation failed for action "${action}" and user ${userId}.`,
  );
}
