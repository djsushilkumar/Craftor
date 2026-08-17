import { logger } from '../../../packages/shared-utils/dist/index.js';
import { ToolRegistry } from '../../../packages/tool-registry/dist/index.js';
import { McpRouter, RouterOptions } from './router.js';
import { StdioTransport } from './transports/stdio.js';
import { SseTransport } from './transports/sse.js';
import { registerDefaultTools } from './handlers/tools.js';
import { ResourceRegistry } from './handlers/resources.js';
import { PromptRegistry } from './handlers/prompts.js';

export interface McpServerDaemonOptions extends RouterOptions {
  ssePort?: number;
}

export class McpServerDaemon {
  private siteUrl: string;
  private secretToken: string;
  private router: McpRouter;
  private stdioTransport: StdioTransport | null = null;
  private sseTransport: SseTransport | null = null;
  private isRunning: boolean = false;

  constructor(
    siteUrl: string = '',
    secretToken: string = '',
    options: McpServerDaemonOptions = {},
  ) {
    this.siteUrl = siteUrl;
    this.secretToken = secretToken;

    this.router = new McpRouter({
      siteUrl: this.siteUrl,
      secretToken: this.secretToken,
      timeoutMs: options.timeoutMs ?? 30000,
      serverName: options.serverName ?? '@craftor/mcp-server',
      serverVersion: options.serverVersion ?? '1.0.0',
    });

    registerDefaultTools();
    ResourceRegistry.initDefaults();
    PromptRegistry.initDefaults();
  }

  public getRouter(): McpRouter {
    return this.router;
  }

  public getSiteUrl(): string {
    return this.siteUrl;
  }

  public isTokenConfigured(): boolean {
    return Boolean(this.secretToken);
  }

  public startStdio(): void {
    if (this.stdioTransport) {
      return;
    }

    this.stdioTransport = new StdioTransport(this.router);
    this.stdioTransport.start();
    this.isRunning = true;

    logger.info('Craftor MCP Server Daemon started over stdio', {
      siteUrl: this.siteUrl,
      tokenConfigured: Boolean(this.secretToken),
      toolsCount: ToolRegistry.count(),
      resourcesCount: ResourceRegistry.list().length,
      promptsCount: PromptRegistry.list().length,
    });
  }

  public async startSse(port: number = 3000): Promise<number> {
    if (this.sseTransport) {
      return port;
    }

    this.sseTransport = new SseTransport(this.router, this.secretToken);
    const actualPort = await this.sseTransport.start(port);
    this.isRunning = true;

    logger.info('Craftor MCP Server Daemon started over SSE', {
      port: actualPort,
      siteUrl: this.siteUrl,
      tokenConfigured: Boolean(this.secretToken),
      toolsCount: ToolRegistry.count(),
    });

    return actualPort;
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.stdioTransport) {
      this.stdioTransport.close();
      this.stdioTransport = null;
    }

    if (this.sseTransport) {
      await this.sseTransport.close();
      this.sseTransport = null;
    }

    this.isRunning = false;
    logger.info('Craftor MCP Server Daemon stopped gracefully');
  }
}
