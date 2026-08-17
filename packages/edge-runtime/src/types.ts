/**
 * Craftor Global Edge Mesh & Serverless Runtime Type Definitions
 */

export interface EdgeRequestContext {
  requestId: string;
  clientIp: string;
  region: string;
  originUrl: string;
  bearerToken?: string;
}

export interface EdgeRoutingRule {
  pattern: string;
  destination: 'origin' | 'edge_cache' | 'swarm_mesh';
  ttlSeconds: number;
}

export interface EdgeMeshNode {
  nodeId: string;
  region: string;
  status: 'healthy' | 'degraded' | 'maintenance';
  activeConnections: number;
  avgLatencyMs: number;
}

export interface EdgeResponsePayload {
  success: boolean;
  nodeId: string;
  region: string;
  latencyMs: number;
  cached: boolean;
  data: unknown;
}
