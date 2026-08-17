/**
 * Craftor WordPress REST API Client
 * High-performance HTTP client with timeout, retry, and structured error handling.
 */

import { logger, withRetry } from '../../shared-utils/dist/index.js';
import { WordPressAuthConfig, createAuthHeader } from './auth.js';

export interface WordPressRestErrorPayload {
  code?: string;
  message?: string;
  data?: {
    status?: number;
    params?: Record<string, unknown>;
    details?: unknown;
  };
}

export class WordPressRestError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly endpoint: string;
  public readonly details: unknown;

  constructor(
    message: string,
    status: number,
    endpoint: string,
    code: string = 'REST_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.name = 'WordPressRestError';
    this.status = status;
    this.endpoint = endpoint;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
}

export interface WordPressRestClientOptions {
  baseUrl: string;
  auth?: WordPressAuthConfig;
  timeoutMs?: number;
  maxRetries?: number;
  customFetch?: typeof fetch;
}

export class WordPressRestClient {
  private readonly baseUrl: string;
  private readonly auth?: WordPressAuthConfig;
  private readonly defaultTimeoutMs: number;
  private readonly defaultMaxRetries: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: WordPressRestClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.auth = options.auth;
    this.defaultTimeoutMs = options.timeoutMs ?? 30000;
    this.defaultMaxRetries = options.maxRetries ?? 2;
    this.fetchImpl = options.customFetch ?? globalThis.fetch;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  public async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  public async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  public async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  public async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const fullUrl = this.buildUrl(path, options?.params);
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
    const maxRetries = options?.maxRetries ?? this.defaultMaxRetries;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Craftor-WordPress-Bridge/1.0.0 (MCP Daemon)',
      ...(options?.headers ?? {}),
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.auth) {
      headers['Authorization'] = createAuthHeader(this.auth);
    }

    return withRetry(
      async () => {
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => {
          controller.abort(new Error(`WordPress REST API request timed out after ${timeoutMs}ms: [${method}] ${fullUrl}`));
        }, timeoutMs);

        try {
          logger.debug(`WordPressRestClient -> [${method}] ${fullUrl}`);

          const response = await this.fetchImpl(fullUrl, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutTimer);

          const contentType = response.headers.get('content-type') ?? '';
          const isJson = contentType.includes('application/json');

          let rawData: unknown = null;
          if (isJson) {
            try {
              rawData = await response.json();
            } catch (jsonErr) {
              const parseMsg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
              throw new WordPressRestError(
                `Failed to parse JSON response from WordPress endpoint: ${parseMsg}`,
                response.status,
                fullUrl,
                'JSON_PARSE_ERROR',
              );
            }
          } else {
            rawData = await response.text();
          }

          if (!response.ok) {
            const errorPayload = rawData as WordPressRestErrorPayload;
            const message = errorPayload?.message ?? `WordPress REST API returned HTTP ${response.status}: ${response.statusText}`;
            const code = errorPayload?.code ?? `HTTP_${response.status}`;

            throw new WordPressRestError(
              message,
              response.status,
              fullUrl,
              code,
              errorPayload?.data,
            );
          }

          return rawData as T;
        } catch (err) {
          clearTimeout(timeoutTimer);
          if (err instanceof WordPressRestError) {
            throw err;
          }
          const message = err instanceof Error ? err.message : String(err);
          throw new WordPressRestError(
            `WordPress network error: ${message}`,
            0,
            fullUrl,
            'NETWORK_FAILURE',
            err,
          );
        }
      },
      {
        maxRetries,
        baseDelayMs: 100,
        shouldRetry: (err) => {
          if (err instanceof WordPressRestError) {
            // Retry on server 5xx errors or network failures, do not retry 4xx client errors
            return err.status === 0 || (err.status >= 500 && err.status <= 599);
          }
          return true;
        },
      },
    );
  }

  public buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')
      ? this.baseUrl
      : `https://${this.baseUrl}`;

    const url = new URL(`${base}${cleanPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }
}
