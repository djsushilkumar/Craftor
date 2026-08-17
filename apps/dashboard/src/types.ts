/**
 * Craftor Cloud Dashboard & Web Studio Type Definitions
 */

import { ElementorNode } from '@craftor/shared-types';

export interface WordPressSiteTenant {
  id: string;
  name: string;
  url: string;
  version: string;
  elementorVersion: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR';
  lastPingMs: number;
  activeSnapshotsCount: number;
  mcpConnected: boolean;
}

export interface AstCanvasState {
  selectedNodeId: string | null;
  zoomLevel: number;
  viewport: 'desktop' | 'tablet' | 'mobile';
  highlightModified: boolean;
  ast: ElementorNode[];
}

export interface PromptExecutionResult {
  prompt: string;
  model: string;
  provider: 'local_ollama' | 'local_vllm' | 'anthropic_claude' | 'openai_gpt4o';
  durationMs: number;
  tokensUsed: number;
  ast: ElementorNode[];
  rawResponse: string;
}

export interface GlobalKitColorToken {
  id: string;
  title: string;
  color: string;
  contrastOnDark: number;
  contrastOnLight: number;
  wcagPass: boolean;
}
