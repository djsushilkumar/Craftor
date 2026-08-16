import * as crypto from 'crypto';

export function generateHexUuid(length: number = 7): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function computeSha256(payload: string): string {
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    process.stderr.write(`[INFO] ${message} ${context ? JSON.stringify(context) : ''}\n`);
  },
  error: (message: string, error?: unknown) => {
    process.stderr.write(
      `[ERROR] ${message} ${error instanceof Error ? error.stack : String(error)}\n`,
    );
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    process.stderr.write(`[DEBUG] ${message} ${context ? JSON.stringify(context) : ''}\n`);
  },
};
