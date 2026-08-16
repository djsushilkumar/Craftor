import { ToolRegistry } from '../../tool-registry/dist/index';
import { logger } from '../../shared-utils/dist/index';

export class McpServerDaemon {
  private siteUrl: string;
  private secretToken: string;

  constructor(siteUrl: string = '', secretToken: string = '') {
    this.siteUrl = siteUrl;
    this.secretToken = secretToken;
  }

  public startStdio(): void {
    logger.info('Craftor MCP Server Daemon started over stdio', {
      siteUrl: this.siteUrl,
      tokenConfigured: Boolean(this.secretToken),
      toolsCount: ToolRegistry.count()
    });
  }
}
