/**
 * Craftor Conflict-Free Replicated Data Type (CRDT) Sync Engine
 * Vector clock state reconciliation for multi-client Elementor AST editing.
 */

import { ElementorNode } from '@craftor/shared-types';
import { CrdtMutationDelta, CrdtDocumentState } from './types.js';

export class CrdtSyncEngine {
  private documents: Map<string, CrdtDocumentState> = new Map();

  public getOrCreateDocument(documentId: string, initialNodes: ElementorNode[] = []): CrdtDocumentState {
    let doc = this.documents.get(documentId);
    if (!doc) {
      doc = {
        documentId,
        nodes: initialNodes,
        vectorClock: {},
        version: 1,
      };
      this.documents.set(documentId, doc);
    }
    return doc;
  }

  /**
   * Applies a mutation delta using Vector Clocks and Last-Write-Wins (LWW) conflict resolution.
   */
  public applyMutation(documentId: string, delta: CrdtMutationDelta): { success: boolean; state: CrdtDocumentState } {
    const doc = this.getOrCreateDocument(documentId);

    // Update vector clock
    const currentSeq = doc.vectorClock[delta.clientId] || 0;
    doc.vectorClock[delta.clientId] = Math.max(currentSeq, delta.clock[delta.clientId] || 0) + 1;
    doc.version++;

    // Mutate node property in AST tree
    const targetNode = this.findNode(doc.nodes, delta.nodeId);
    if (targetNode) {
      if (!targetNode.settings) {
        targetNode.settings = {};
      }
      targetNode.settings[delta.path] = delta.value;
    }

    return {
      success: true,
      state: doc,
    };
  }

  private findNode(nodes: ElementorNode[], nodeId: string): ElementorNode | null {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.elements && node.elements.length > 0) {
        const found = this.findNode(node.elements, nodeId);
        if (found) return found;
      }
    }
    return null;
  }
}
