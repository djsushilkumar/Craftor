export type JsonRpcId = string | number | null;

export interface JsonRpcRequest<TParams = Record<string, unknown>> {
  jsonrpc: '2.0';
  id: JsonRpcId;
  method: string;
  params?: TParams;
}

export interface JsonRpcNotification<TParams = Record<string, unknown>> {
  jsonrpc: '2.0';
  method: string;
  params?: TParams;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

export type JsonRpcError = JsonRpcErrorObject;

export interface JsonRpcResponse<TResult = unknown> {
  jsonrpc: '2.0';
  id: JsonRpcId;
  result?: TResult;
  error?: JsonRpcErrorObject;
}
