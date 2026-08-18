export * from './daemon.js';
export * from './router.js';
export * from './errors.js';
export * from './transports/stdio.js';
export * from './transports/sse.js';
export * from './handlers/tools.js';
export * from './handlers/resources.js';
export * from './handlers/prompts.js';
export * from './safety/confirmation.js';
export * from './safety/approval.js';

import { McpServerDaemon } from './daemon.js';

// Auto-bootstrap when executed directly as main script by AI Clients (Cursor, Antigravity, Claude Desktop)
if (process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('craftor-mcp.js'))) {
  const site = process.env.WORDPRESS_BASE_URL || '';
  const token = process.env.WORDPRESS_API_TOKEN || '';
  const daemon = new McpServerDaemon(site, token);
  daemon.startStdio();
}
