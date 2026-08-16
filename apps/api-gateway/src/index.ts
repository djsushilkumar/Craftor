import { logger } from '../../../packages/shared-utils/dist/index';

export function startGateway(port: number = 4000): void {
  logger.info('Craftor Cloud API Gateway & SSE Proxy initialized', { port });
}
