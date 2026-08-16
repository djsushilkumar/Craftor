export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 100;
  const maxDelayMs = options.maxDelayMs ?? 5000;
  const factor = options.factor ?? 2;
  const jitter = options.jitter ?? true;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt > maxRetries) {
        break;
      }

      if (options.shouldRetry && !options.shouldRetry(err, attempt)) {
        break;
      }

      let delay = baseDelayMs * Math.pow(factor, attempt - 1);
      if (jitter) {
        delay += Math.random() * (baseDelayMs / 2);
      }
      const boundedDelay = Math.min(delay, maxDelayMs);

      await sleep(boundedDelay);
    }
  }

  throw lastError;
}
