import { logger } from '../../../shared-utils/dist/index.js';
import { McpRouter } from '../router.js';
import { createParseError } from '../errors.js';

export class StdioTransport {
  private router: McpRouter;
  private buffer: string = '';
  private isRunning: boolean = false;
  private onDataHandler: ((chunk: Buffer | string) => void) | null = null;
  private onEndHandler: (() => void) | null = null;

  constructor(router: McpRouter) {
    this.router = router;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    logger.info('StdioTransport: Initializing MCP stdio stream listeners');

    process.stdin.setEncoding('utf8');

    this.onDataHandler = (chunk: Buffer | string) => {
      this.handleChunk(typeof chunk === 'string' ? chunk : chunk.toString('utf8'));
    };

    this.onEndHandler = () => {
      logger.info('StdioTransport: stdin stream closed');
      this.close();
    };

    process.stdin.on('data', this.onDataHandler);
    process.stdin.on('end', this.onEndHandler);
  }

  public close(): void {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;

    if (this.onDataHandler) {
      process.stdin.removeListener('data', this.onDataHandler);
      this.onDataHandler = null;
    }

    if (this.onEndHandler) {
      process.stdin.removeListener('end', this.onEndHandler);
      this.onEndHandler = null;
    }

    logger.info('StdioTransport: Stream connection closed gracefully');
  }

  private handleChunk(chunk: string): void {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      void this.processMessage(trimmed);
    }
  }

  private async processMessage(rawMessage: string): Promise<void> {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawMessage);
    } catch (parseErr) {
      const err = createParseError(
        parseErr instanceof Error ? parseErr.message : 'Invalid JSON input',
      );
      this.sendResponse({
        jsonrpc: '2.0',
        id: null,
        error: err.toJsonRpcError(),
      });
      return;
    }

    const response = await this.router.dispatch(parsed);
    this.sendResponse(response);
  }

  private sendResponse(response: unknown): void {
    try {
      const jsonLine = JSON.stringify(response);
      process.stdout.write(jsonLine + '\n');
    } catch (serializeErr) {
      logger.error('StdioTransport: Failed to serialize JSON-RPC response', serializeErr);
    }
  }
}
