import { logger } from '../../../packages/shared-utils/dist/index';

export class NotificationService {
  public static dispatchEvent(event: string, payload: Record<string, unknown>): void {
    logger.info('Notification event dispatched', { event, payload });
  }
}
