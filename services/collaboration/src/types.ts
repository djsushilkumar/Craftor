/**
 * Craftor Multi-Agent Collaborative Swarm & CRDT Type Definitions
 */

import { ElementorNode } from '@craftor/shared-types';

export type AgentRole = 'designer' | 'copywriter' | 'seo_expert' | 'qa_engineer';

export interface AgentTask {
  role: AgentRole;
  instruction: string;
  targetNodeId?: string;
}

export interface SwarmExecutionResult {
  sessionId: string;
  completedTasks: number;
  mergedAst: ElementorNode[];
  agentContributions: Array<{
    role: AgentRole;
    action: string;
    nodeId?: string;
  }>;
}

export interface CrdtVectorClock {
  [clientId: string]: number;
}

export interface CrdtMutationDelta {
  mutationId: string;
  clientId: string;
  clock: CrdtVectorClock;
  timestamp: number;
  nodeId: string;
  path: string;
  value: unknown;
}

export interface CrdtDocumentState {
  documentId: string;
  nodes: ElementorNode[];
  vectorClock: CrdtVectorClock;
  version: number;
}
