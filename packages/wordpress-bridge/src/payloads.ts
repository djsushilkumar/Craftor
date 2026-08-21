/**
 * Craftor WordPress Payload Helpers
 * Shared validation, query-parameter and Elementor metadata utilities used by the
 * WordPress REST bridges to keep request construction consistent across resources.
 */

export type RestParams = Record<string, string | number | boolean | undefined>;

/**
 * Validates a WordPress resource identifier, throwing a consistent error message.
 */
export function assertPositiveId(id: number, resource: string): number {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error(`Invalid ${resource} ID: ${id}. ID must be a positive integer.`);
  }
  return id;
}

/**
 * Copies every key of `source` that is not `undefined` onto a new request body,
 * joining array values into the comma-separated form the WP REST API expects.
 */
export function pickDefined<T extends object>(
  source: T | undefined,
  keys: readonly (keyof T)[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (!source) return body;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined) {
      body[key as string] = value;
    }
  }
  return body;
}

/**
 * Builds WP REST query parameters from a query object, skipping falsy values and
 * empty arrays, then merges caller-supplied parameters on top.
 */
export function buildQueryParams<T extends object>(
  query: T | undefined,
  keys: readonly (keyof T)[],
  overrides?: RestParams,
): RestParams {
  const params: RestParams = {};
  if (query) {
    for (const key of keys) {
      const value = query[key];
      if (Array.isArray(value)) {
        if (value.length > 0) params[key as string] = value.join(',');
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        params[key as string] = value;
      } else if (value) {
        params[key as string] = value as string;
      }
    }
  }
  return { ...params, ...(overrides ?? {}) };
}

/**
 * Merges Elementor AST data into a request body's `meta` object, enabling builder edit mode.
 */
export function applyElementorMeta(
  requestBody: Record<string, unknown>,
  payload: { meta?: Record<string, unknown>; elementor_data?: unknown },
): Record<string, unknown> {
  if (!payload.meta && !payload.elementor_data) return requestBody;

  const meta = { ...(payload.meta ?? {}) };
  if (payload.elementor_data !== undefined) {
    meta._elementor_data =
      typeof payload.elementor_data === 'string'
        ? payload.elementor_data
        : JSON.stringify(payload.elementor_data);
    meta._elementor_edit_mode = 'builder';
  }
  requestBody.meta = meta;
  return requestBody;
}

/**
 * Resolves the WP REST endpoint for a taxonomy collection or a single term.
 */
export function taxonomyEndpoint(taxonomy: string = 'categories', id?: number): string {
  const base = taxonomy === 'tags' ? '/wp-json/wp/v2/tags' : `/wp-json/wp/v2/${taxonomy}`;
  return id === undefined ? base : `${base}/${id}`;
}
