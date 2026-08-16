export interface JsonRpcRequest<T = Record<string, unknown>> {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: T;
}

export interface JsonRpcResponse<T = Record<string, unknown>> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface McpToolDefinition {
  id: string;
  version: string;
  category: string;
  description: string;
  permissions: string[];
  deprecated?: boolean;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

export interface ElementorNode {
  id: string;
  elType: 'container' | 'widget' | 'section' | 'column';
  isInner?: boolean;
  widgetType?: string;
  settings: Record<string, unknown>;
  elements: ElementorNode[];
}

export interface SnapshotRecord {
  id: string;
  uuid: string;
  postId: number;
  actionContext: string;
  payloadChecksum: string;
  createdAt: string;
}
