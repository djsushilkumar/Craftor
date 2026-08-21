/**
 * Craftor MCP Result Helpers
 * Shared builders for the JSON-encoded text results returned by every MCP tool handler.
 */

import { McpCallToolResult } from '../../../shared-types/dist/index.js';

/**
 * Wraps a payload as a successful MCP tool result with pretty-printed JSON text.
 */
export function jsonResult(data: unknown): McpCallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Builds a failed MCP tool result carrying a single error message.
 */
export function jsonError(message: string): McpCallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

/**
 * Builds a failed MCP tool result from a structured error payload.
 */
export function jsonErrorResult(data: unknown): McpCallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    isError: true,
  };
}
