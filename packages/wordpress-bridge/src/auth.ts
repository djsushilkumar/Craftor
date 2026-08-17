/**
 * Craftor WordPress Authentication Strategies
 * Supports Application Passwords, Bearer Tokens, and JWT Authentication.
 */

export interface ApplicationPasswordAuth {
  type: 'application_password';
  username: string;
  applicationPassword: string;
}

export interface BearerTokenAuth {
  type: 'bearer';
  token: string;
}

export interface JwtAuth {
  type: 'jwt';
  token: string;
}

export type WordPressAuthConfig =
  | ApplicationPasswordAuth
  | BearerTokenAuth
  | JwtAuth;

export class WordPressAuthError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'WordPressAuthError';
    this.code = code;
  }
}

/**
 * Creates the HTTP Authorization header value from the provided auth configuration.
 */
export function createAuthHeader(auth: WordPressAuthConfig): string {
  switch (auth.type) {
    case 'application_password': {
      if (!auth.username || !auth.applicationPassword) {
        throw new WordPressAuthError(
          'Username and application password must be non-empty.',
          'INVALID_APPLICATION_PASSWORD',
        );
      }
      const cleanPassword = auth.applicationPassword.replace(/\s+/g, '');
      const credentials = `${auth.username}:${cleanPassword}`;
      const encoded = Buffer.from(credentials, 'utf8').toString('base64');
      return `Basic ${encoded}`;
    }

    case 'bearer': {
      if (!auth.token || !auth.token.trim()) {
        throw new WordPressAuthError(
          'Bearer token must not be empty.',
          'INVALID_BEARER_TOKEN',
        );
      }
      return `Bearer ${auth.token.trim()}`;
    }

    case 'jwt': {
      if (!auth.token || !auth.token.trim()) {
        throw new WordPressAuthError(
          'JWT token must not be empty.',
          'INVALID_JWT_TOKEN',
        );
      }
      return `Bearer ${auth.token.trim()}`;
    }

    default: {
      const exhaustiveCheck: never = auth;
      throw new WordPressAuthError(
        `Unsupported authentication type: ${JSON.stringify(exhaustiveCheck)}`,
        'UNSUPPORTED_AUTH_TYPE',
      );
    }
  }
}

/**
 * Validates and normalizes raw authentication config objects.
 */
export function validateAuthConfig(raw: unknown): WordPressAuthConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new WordPressAuthError('Auth configuration must be a non-null object.');
  }

  const obj = raw as Record<string, unknown>;
  const type = obj.type;

  if (type === 'application_password') {
    if (typeof obj.username !== 'string' || typeof obj.applicationPassword !== 'string') {
      throw new WordPressAuthError('Application Password auth requires "username" and "applicationPassword" strings.');
    }
    return {
      type: 'application_password',
      username: obj.username,
      applicationPassword: obj.applicationPassword,
    };
  }

  if (type === 'bearer') {
    if (typeof obj.token !== 'string') {
      throw new WordPressAuthError('Bearer auth requires "token" string.');
    }
    return {
      type: 'bearer',
      token: obj.token,
    };
  }

  if (type === 'jwt') {
    if (typeof obj.token !== 'string') {
      throw new WordPressAuthError('JWT auth requires "token" string.');
    }
    return {
      type: 'jwt',
      token: obj.token,
    };
  }

  throw new WordPressAuthError(`Unknown auth type: "${String(type)}"`);
}

/**
 * Returns a masked representation of credentials safe for logs and diagnostics.
 */
export function maskAuthCredentials(auth: WordPressAuthConfig): string {
  switch (auth.type) {
    case 'application_password': {
      const user = auth.username;
      return `Basic user=${user} [password masked]`;
    }
    case 'bearer':
    case 'jwt': {
      const token = auth.token;
      const preview = token.length > 8 ? `${token.slice(0, 4)}...${token.slice(-4)}` : '****';
      return `${auth.type.toUpperCase()} token=${preview}`;
    }
  }
}
