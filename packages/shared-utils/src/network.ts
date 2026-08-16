export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeoutMs = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort(fetchOptions.signal?.reason);
    });
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
