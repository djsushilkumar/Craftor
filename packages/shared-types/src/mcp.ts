export type JsonSchemaPropertyType =
  'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';

export interface JsonSchemaProperty {
  type: JsonSchemaPropertyType | JsonSchemaPropertyType[];
  description?: string;
  enum?: (string | number | boolean)[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

export type ToolCategory =
  | 'wp_content_core'
  | 'elementor_containers'
  | 'elementor_widgets'
  | 'elementor_styles'
  | 'woocommerce_catalog'
  | 'woocommerce_orders'
  | 'media_assets'
  | 'seo_metadata'
  | 'site_operations'
  | 'multisite_enterprise';

export interface McpToolDefinition {
  id: string;
  name: string;
  version?: string;
  category?: ToolCategory | string;
  description: string;
  permissions?: string[];
  deprecated?: boolean;
  inputSchema?: {
    type: 'object';
    required?: string[];
    properties: Record<string, JsonSchemaProperty>;
    additionalProperties?: boolean;
  };
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

export interface McpContentBlock {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
  resource?: {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  };
}

export interface McpCallToolResult {
  content: McpContentBlock[];
  isError?: boolean;
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpResourceContents {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

export interface McpPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface McpPromptDefinition {
  name: string;
  description?: string;
  arguments?: McpPromptArgument[];
}

export interface McpPromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: McpContentBlock;
}

export interface McpInitializeParams {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: {
    tools?: { listChanged?: boolean };
    resources?: { subscribe?: boolean; listChanged?: boolean };
    prompts?: { listChanged?: boolean };
    logging?: Record<string, unknown>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}
