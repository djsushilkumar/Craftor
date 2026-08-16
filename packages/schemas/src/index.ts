export const JSON_RPC_2_0_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'JsonRpcRequest',
  type: 'object',
  required: ['jsonrpc', 'method', 'id'],
  properties: {
    jsonrpc: { type: 'string', enum: ['2.0'] },
    method: { type: 'string' },
    id: { type: ['string', 'number'] },
    params: { type: 'object' }
  }
} as const;

export const TOOL_REGISTRY_ENTRY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ToolRegistryEntry',
  type: 'object',
  required: ['id', 'version', 'category', 'permissions', 'inputs', 'outputs'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9_]+$' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    category: { type: 'string' },
    permissions: { type: 'array', items: { type: 'string' } },
    deprecated: { type: 'boolean', default: false },
    inputs: { type: 'object' },
    outputs: { type: 'object' }
  }
} as const;

export const ELEMENTOR_CONTAINER_MUTATION_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ElementorContainerMutation',
  type: 'object',
  required: ['page_id', 'flex_direction'],
  properties: {
    page_id: { type: 'integer', minimum: 1 },
    flex_direction: { type: 'string', enum: ['row', 'column', 'row-reverse', 'column-reverse'] },
    justify_content: { type: 'string', enum: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
    align_items: { type: 'string', enum: ['flex-start', 'center', 'flex-end', 'stretch'] }
  }
} as const;
