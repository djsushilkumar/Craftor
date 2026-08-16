export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function writeLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown> | unknown,
): void {
  const timestamp = new Date().toISOString();
  let contextStr = '';

  if (context !== undefined) {
    if (context instanceof Error) {
      contextStr = ` | Error: ${context.stack ?? context.message}`;
    } else if (typeof context === 'object' && context !== null) {
      try {
        contextStr = ` | ${JSON.stringify(context)}`;
      } catch {
        contextStr = ' | [Unserializable Context]';
      }
    } else {
      contextStr = ` | ${String(context)}`;
    }
  }

  process.stderr.write(`[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}\n`);
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  writeLog('info', message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  writeLog('warn', message, context);
}

export function logError(message: string, error?: unknown): void {
  writeLog('error', message, error);
}

export function logDebug(message: string, context?: Record<string, unknown>): void {
  writeLog('debug', message, context);
}

export const logger = {
  info: logInfo,
  warn: logWarn,
  error: logError,
  debug: logDebug,
};
