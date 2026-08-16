import { DRAFT_07_SCHEMA_URI, JSON_RPC_ID_SCHEMA, JSON_RPC_VERSION_SCHEMA } from './fragments.js';

export const INITIALIZE_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpInitializeRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method', 'params'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['initialize'] },
    params: {
      type: 'object',
      required: ['protocolVersion', 'capabilities', 'clientInfo'],
      additionalProperties: false,
      properties: {
        protocolVersion: { type: 'string' },
        capabilities: { type: 'object' },
        clientInfo: {
          type: 'object',
          required: ['name', 'version'],
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

export const PING_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpPingRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['ping'] },
    params: { type: 'object' },
  },
} as const;

export const TOOLS_LIST_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpToolsListRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['tools/list'] },
    params: {
      type: 'object',
      additionalProperties: false,
      properties: {
        cursor: { type: ['string', 'null'] },
      },
    },
  },
} as const;

export const TOOLS_CALL_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpToolsCallRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method', 'params'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['tools/call'] },
    params: {
      type: 'object',
      required: ['name', 'arguments'],
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        arguments: { type: 'object' },
      },
    },
  },
} as const;

export const RESOURCES_LIST_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpResourcesListRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['resources/list'] },
    params: {
      type: 'object',
      additionalProperties: false,
      properties: {
        cursor: { type: ['string', 'null'] },
      },
    },
  },
} as const;

export const RESOURCES_READ_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpResourcesReadRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method', 'params'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['resources/read'] },
    params: {
      type: 'object',
      required: ['uri'],
      additionalProperties: false,
      properties: {
        uri: { type: 'string', format: 'uri' },
      },
    },
  },
} as const;

export const PROMPTS_LIST_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpPromptsListRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['prompts/list'] },
    params: {
      type: 'object',
      additionalProperties: false,
      properties: {
        cursor: { type: ['string', 'null'] },
      },
    },
  },
} as const;

export const PROMPTS_GET_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpPromptsGetRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method', 'params'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['prompts/get'] },
    params: {
      type: 'object',
      required: ['name'],
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        arguments: { type: 'object' },
      },
    },
  },
} as const;

export const SHUTDOWN_REQUEST_SCHEMA = {
  $schema: DRAFT_07_SCHEMA_URI,
  title: 'McpShutdownRequest',
  type: 'object',
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
  properties: {
    jsonrpc: JSON_RPC_VERSION_SCHEMA,
    id: JSON_RPC_ID_SCHEMA,
    method: { type: 'string', enum: ['shutdown'] },
    params: { type: 'object' },
  },
} as const;
