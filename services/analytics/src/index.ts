import { logger } from '../../../packages/shared-utils/dist/index.js';

export class AnalyticsService {
  public static trackToolInvocation(toolName: string, durationMs: number): void {
    logger.debug('Analytics metric recorded', { toolName, durationMs });
  }
}

export * from './telemetry.js';

