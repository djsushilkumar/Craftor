/**
 * Craftor Self-Healing & Automated AST / PHP Error Recovery Engine
 */

import { ElementorNode } from '@craftor/shared-types';
import { AstRepairReport, PhpErrorContext, PhpTriageResult } from './types.js';

export class AutoRepairEngine {
  /**
   * Scans and automatically repairs corrupt AST trees (missing UUIDs, circular refs, broken settings).
   */
  public repairAst(rawAst: unknown[]): AstRepairReport {
    const fixedIssues: string[] = [];
    let reconstructedNodeCount = 0;
    const seenIds = new Set<string>();

    const sanitizeNode = (rawNode: unknown, depth = 0): ElementorNode | null => {
      if (depth > 20) {
        fixedIssues.push('Severed circular/excessive nesting depth reference (>20 levels)');
        return null;
      }

      if (!rawNode || typeof rawNode !== 'object') {
        fixedIssues.push('Removed malformed non-object AST primitive');
        return null;
      }

      const nodeObj = rawNode as Record<string, unknown>;
      reconstructedNodeCount++;

      // 1. Repair ID
      let id = typeof nodeObj.id === 'string' && nodeObj.id.trim().length > 0 ? nodeObj.id.trim() : '';
      if (!id || seenIds.has(id)) {
        id = `repaired_${Math.random().toString(36).substring(2, 9)}`;
        fixedIssues.push(`Assigned new unique ID to node: ${id}`);
      }
      seenIds.add(id);

      // 2. Repair elType
      let elType = typeof nodeObj.elType === 'string' ? nodeObj.elType : 'widget';
      if (!['container', 'widget', 'section', 'column'].includes(elType)) {
        elType = 'container';
        fixedIssues.push(`Corrected invalid elType '${nodeObj.elType}' to 'container'`);
      }

      // 3. Repair settings
      const settings = (nodeObj.settings && typeof nodeObj.settings === 'object' && !Array.isArray(nodeObj.settings)
        ? { ...(nodeObj.settings as Record<string, unknown>) }
        : {}) as Record<string, unknown>;

      // 4. Repair elements
      const elements: ElementorNode[] = [];
      if (Array.isArray(nodeObj.elements)) {
        for (const child of nodeObj.elements) {
          const sanitizedChild = sanitizeNode(child, depth + 1);
          if (sanitizedChild) elements.push(sanitizedChild);
        }
      }

      const cleanNode: ElementorNode = {
        id,
        elType: elType as 'container' | 'widget' | 'section' | 'column',
        settings,
        elements,
      };

      if (elType === 'widget' && typeof nodeObj.widgetType === 'string') {
        cleanNode.widgetType = nodeObj.widgetType;
      }

      return cleanNode;
    };

    const cleanAst: ElementorNode[] = [];
    if (Array.isArray(rawAst)) {
      for (const node of rawAst) {
        const sanitized = sanitizeNode(node, 0);
        if (sanitized) cleanAst.push(sanitized);
      }
    }

    return {
      repaired: fixedIssues.length > 0,
      fixedIssues,
      reconstructedNodeCount,
      cleanAst,
    };
  }
}

export class PhpErrorTriage {
  /**
   * Triages PHP errors, memory exhaustion, and exception backtraces into actionable mitigation actions.
   */
  public triageError(errorContext: PhpErrorContext): PhpTriageResult {
    const msg = errorContext.errorMessage.toLowerCase();

    // 1. Allowed memory exhausted
    if (msg.includes('allowed memory size') || msg.includes('bytes exhausted')) {
      return {
        severity: 'fatal',
        rootCause: 'PHP Memory Limit Exceeded during Elementor AST rendering or heavy query',
        mitigationAction: 'increase_memory_limit',
        autoFixPayload: {
          wpConfigConstant: "define('WP_MEMORY_LIMIT', '512M');",
          iniOverride: 'memory_limit = 512M',
        },
      };
    }

    // 2. Maximum execution time exceeded
    if (msg.includes('maximum execution time') || msg.includes('time limit')) {
      return {
        severity: 'fatal',
        rootCause: 'Script Timeout in long-running REST API / MCP batch execution',
        mitigationAction: 'increase_memory_limit',
        autoFixPayload: {
          wpConfigConstant: "set_time_limit(300);",
          iniOverride: 'max_execution_time = 300',
        },
      };
    }

    // 3. Corrupted postmeta or database crash
    if (msg.includes('corrupted') || msg.includes('elementor_data') || msg.includes('json_decode')) {
      return {
        severity: 'fatal',
        rootCause: 'Elementor postmeta AST document corruption detected in database',
        mitigationAction: 'restore_snapshot',
        recommendedSnapshotId: 'auto_latest_valid_snapshot',
        autoFixPayload: {
          rollbackTarget: 'latest_clean_snapshot',
          flushCache: true,
        },
      };
    }

    // Default fallback
    return {
      severity: 'warning',
      rootCause: `Unhandled PHP Error: ${errorContext.errorMessage} in ${errorContext.errorFile}:${errorContext.errorLine}`,
      mitigationAction: 'flush_rewrite_rules',
      autoFixPayload: {
        action: 'flush_rules_and_cache',
      },
    };
  }
}
