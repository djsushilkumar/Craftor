import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcId,
  McpInitializeResult,
} from '../../../packages/shared-types/dist/index.js';
import { logger } from '../../../packages/shared-utils/dist/index.js';
import {
  createInvalidRequestError,
  createMethodNotFoundError,
  createTimeoutError,
  McpError,
} from './errors.js';
import { handleToolsList, handleToolsCall, registerDefaultTools } from './handlers/tools.js';
import {
  handleResourcesList,
  handleResourcesRead,
  ResourceRegistry,
} from './handlers/resources.js';
import { handlePromptsList, handlePromptsGet, PromptRegistry } from './handlers/prompts.js';

export interface RouterOptions {
  siteUrl?: string;
  secretToken?: string;
  timeoutMs?: number;
  serverName?: string;
  serverVersion?: string;
}

export class McpRouter {
  private siteUrl: string;
  private secretToken: string;
  private timeoutMs: number;
  private serverName: string;
  private serverVersion: string;
  private isShutdown: boolean = false;

  constructor(options: RouterOptions = {}) {
    this.siteUrl = options.siteUrl ?? '';
    this.secretToken = options.secretToken ?? '';
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.serverName = options.serverName ?? '@craftor/mcp-server';
    this.serverVersion = options.serverVersion ?? '1.0.0';

    registerDefaultTools();
    ResourceRegistry.initDefaults();
    PromptRegistry.initDefaults();
  }

  public setSiteConfig(siteUrl: string, secretToken: string): void {
    this.siteUrl = siteUrl;
    this.secretToken = secretToken;
  }

  public async dispatch(rawRequest: unknown): Promise<JsonRpcResponse<unknown>> {
    let reqId: JsonRpcId = null;

    try {
      if (typeof rawRequest !== 'object' || rawRequest === null) {
        throw createInvalidRequestError('Request body must be a valid JSON object');
      }

      const request = rawRequest as Record<string, unknown>;

      if (request.jsonrpc !== '2.0') {
        throw createInvalidRequestError('Invalid or missing "jsonrpc" version. Expected "2.0"');
      }

      if (typeof request.method !== 'string' || !request.method.trim()) {
        throw createInvalidRequestError('Missing or empty "method" property');
      }

      reqId = request.id !== undefined && request.id !== null ? (request.id as JsonRpcId) : null;

      if (this.isShutdown && request.method !== 'ping') {
        throw new McpError(-32000, 'MCP Server has been shut down');
      }

      const immutableRequest: JsonRpcRequest = Object.freeze({
        jsonrpc: '2.0',
        id: reqId,
        method: request.method,
        params:
          typeof request.params === 'object' && request.params !== null
            ? (request.params as Record<string, unknown>)
            : undefined,
      });

      const result = await this.executeWithTimeout(
        () => this.routeMethod(immutableRequest),
        this.timeoutMs,
      );

      return {
        jsonrpc: '2.0',
        id: reqId,
        result,
      };
    } catch (err) {
      if (err instanceof McpError) {
        return {
          jsonrpc: '2.0',
          id: reqId,
          error: err.toJsonRpcError(),
        };
      }

      const message = err instanceof Error ? err.message : String(err);
      logger.error('Unhandled router error', err);
      return {
        jsonrpc: '2.0',
        id: reqId,
        error: {
          code: -32603,
          message: `Internal server error: ${message}`,
        },
      };
    }
  }

  private async routeMethod(request: JsonRpcRequest): Promise<unknown> {
    const { method, params } = request;

    switch (method) {
      case 'initialize': {
        return this.handleInitialize();
      }

      case 'ping': {
        return {};
      }

      case 'tools/list': {
        return handleToolsList(params);
      }

      case 'tools/call': {
        return handleToolsCall(params, this.siteUrl, this.secretToken);
      }

      case 'resources/list': {
        return handleResourcesList(params);
      }

      case 'resources/read': {
        return handleResourcesRead(params, this.siteUrl, this.secretToken);
      }

      case 'prompts/list': {
        return handlePromptsList(params);
      }

      case 'prompts/get': {
        return handlePromptsGet(params);
      }

      case 'shutdown': {
        this.isShutdown = true;
        logger.info('Craftor MCP Server received shutdown signal.');
        return { success: true, message: 'Craftor MCP Server shut down successfully.' };
      }

      default: {
        throw createMethodNotFoundError(method);
      }
    }
  }

  private handleInitialize(): McpInitializeResult {
    return {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
        prompts: { listChanged: false },
        logging: {},
      },
      serverInfo: {
        name: this.serverName,
        version: this.serverVersion,
      },
    };
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(createTimeoutError(timeoutMs));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } finally {
      if (timer !== null) {
        clearTimeout(timer);
      }
    }
  }
}
