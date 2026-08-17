import { JsonRpcErrorObject } from '../../shared-types/dist/index.js';

export const JSON_RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  EXECUTION_TIMEOUT: -32000,
  RESOURCE_NOT_FOUND: -32001,
  PROMPT_NOT_FOUND: -32002,
  AST_CORRUPTION_GUARD: -32003,
  ROLLBACK_FAILED: -32004,
  TARGET_NOT_FOUND: -32005,
  TOOL_NOT_FOUND: -32601,
  UNAUTHORIZED: -32004,
} as const;

export type JsonRpcErrorCode = (typeof JSON_RPC_ERROR_CODES)[keyof typeof JSON_RPC_ERROR_CODES];

export class McpError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, McpError.prototype);
  }

  public toJsonRpcError(): JsonRpcErrorObject {
    const err: JsonRpcErrorObject = {
      code: this.code,
      message: this.message,
    };
    if (this.data !== undefined) {
      err.data = this.data;
    }
    return err;
  }
}

export function createParseError(details?: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.PARSE_ERROR,
    details ? `Parse error: ${details}` : 'Invalid JSON was received by the server.',
  );
}

export function createInvalidRequestError(details?: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.INVALID_REQUEST,
    details ? `Invalid Request: ${details}` : 'The JSON sent is not a valid Request object.',
  );
}

export function createMethodNotFoundError(method: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
    `Method "${method}" not found or not supported by Craftor MCP Server.`,
  );
}

export function createInvalidParamsError(details?: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.INVALID_PARAMS,
    details ? `Invalid params: ${details}` : 'Invalid method parameter(s).',
  );
}

export function createInternalError(details?: string, data?: unknown): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
    details ? `Internal error: ${details}` : 'Internal JSON-RPC error.',
    data,
  );
}

export function createTimeoutError(timeoutMs: number = 30000): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.EXECUTION_TIMEOUT,
    `Execution timed out after ${timeoutMs}ms.`,
  );
}

export function createResourceNotFoundError(uri: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.RESOURCE_NOT_FOUND,
    `Resource with URI "${uri}" not found.`,
  );
}

export function createPromptNotFoundError(name: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.PROMPT_NOT_FOUND,
    `Prompt with name "${name}" not found.`,
  );
}

export function createToolNotFoundError(name: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.TOOL_NOT_FOUND,
    `Tool with name "${name}" is not registered in Craftor MCP Tool Registry.`,
  );
}

export function createAstCorruptionGuardError(details?: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.AST_CORRUPTION_GUARD,
    details ? `AST corruption guard triggered: ${details}` : 'Elementor AST corruption detected. Rolled back mutation.',
  );
}

export function createRollbackFailedError(details?: string, data?: unknown): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.ROLLBACK_FAILED,
    details ? `Rollback failed: ${details}` : 'Failed to restore target snapshot.',
    data,
  );
}

export function createTargetNotFoundError(targetType: string, targetId: string | number): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.TARGET_NOT_FOUND,
    `Target ${targetType} with ID "${targetId}" not found.`,
  );
}

export function createUnauthorizedError(details?: string): McpError {
  return new McpError(
    JSON_RPC_ERROR_CODES.UNAUTHORIZED,
    details ? `Unauthorized: ${details}` : 'Authentication failed or missing secret bearer token.',
  );
}
