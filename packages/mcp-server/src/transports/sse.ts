import * as http from 'http';
import { logger, generateHexUuid, constantTimeCompare } from '../../../shared-utils/dist/index.js';
import { McpRouter } from '../router.js';
import { createParseError, createUnauthorizedError } from '../errors.js';

export interface SseClientSession {
  id: string;
  res: http.ServerResponse;
  connectedAt: Date;
  keepAliveTimer: NodeJS.Timeout;
}

export class SseTransport {
  private router: McpRouter;
  private server: http.Server | null = null;
  private secretToken: string;
  private sessions: Map<string, SseClientSession> = new Map();
  private isRunning: boolean = false;

  constructor(router: McpRouter, secretToken: string = '') {
    this.router = router;
    this.secretToken = secretToken;
  }

  public getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  public async start(port: number = 3000): Promise<number> {
    if (this.isRunning && this.server) {
      const addr = this.server.address();
      return typeof addr === 'object' && addr !== null ? addr.port : port;
    }

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleHttpRequest(req, res);
      });

      this.server.on('error', (err) => {
        logger.error('SseTransport server error', err);
        reject(err);
      });

      this.server.listen(port, () => {
        this.isRunning = true;
        const actualPort = (this.server?.address() as { port: number })?.port ?? port;
        logger.info(`SseTransport: Craftor MCP Server listening on SSE port ${actualPort}`);
        resolve(actualPort);
      });
    });
  }

  public async close(): Promise<void> {
    if (!this.isRunning || !this.server) {
      return;
    }

    for (const [, session] of this.sessions) {
      clearInterval(session.keepAliveTimer);
      try {
        session.res.end();
      } catch {
        // Ignore socket teardown errors
      }
    }
    this.sessions.clear();

    return new Promise((resolve) => {
      this.server?.close(() => {
        this.isRunning = false;
        this.server = null;
        logger.info('SseTransport: Server closed successfully');
        resolve();
      });
    });
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const pathname = url.pathname;

    if (req.method === 'GET' && pathname === '/sse') {
      this.handleSseConnect(req, res);
      return;
    }

    if (req.method === 'POST' && (pathname === '/message' || pathname === '/')) {
      this.handleMessagePost(req, res, url);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found. Use /sse or /message' }));
  }

  private handleSseConnect(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (this.secretToken) {
      const authHeader = req.headers['authorization'] ?? '';
      const token = authHeader.replace(/^Bearer\s+/i, '');
      if (!constantTimeCompare(token, this.secretToken)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            createUnauthorizedError('Invalid bearer token for SSE stream').toJsonRpcError(),
          ),
        );
        return;
      }
    }

    const sessionId = generateHexUuid(12);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    res.write(`event: endpoint\ndata: /message?sessionId=${sessionId}\n\n`);

    const keepAliveTimer = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 15000);

    const session: SseClientSession = {
      id: sessionId,
      res,
      connectedAt: new Date(),
      keepAliveTimer,
    };

    this.sessions.set(sessionId, session);
    logger.info(`SseTransport: Client connected. SessionId: ${sessionId}`);

    req.on('close', () => {
      clearInterval(keepAliveTimer);
      this.sessions.delete(sessionId);
      logger.info(`SseTransport: Client disconnected. SessionId: ${sessionId}`);
    });
  }

  private handleMessagePost(req: http.IncomingMessage, res: http.ServerResponse, url: URL): void {
    if (this.secretToken) {
      const authHeader = req.headers['authorization'] ?? '';
      const token = authHeader.replace(/^Bearer\s+/i, '');
      if (!constantTimeCompare(token, this.secretToken)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            createUnauthorizedError('Invalid bearer token for message').toJsonRpcError(),
          ),
        );
        return;
      }
    }

    let body = '';
    req.setEncoding('utf8');

    req.on('data', (chunk: string) => {
      body += chunk;
    });

    req.on('end', async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch (parseErr) {
        const err = createParseError(
          parseErr instanceof Error ? parseErr.message : 'Invalid JSON payload in POST request',
        );
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: err.toJsonRpcError(),
          }),
        );
        return;
      }

      const response = await this.router.dispatch(parsed);

      const sessionId = url.searchParams.get('sessionId');
      if (sessionId && this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!;
        session.res.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    });
  }
}
