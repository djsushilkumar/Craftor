/**
 * Craftor Enterprise Zero-Trust Security & Prompt Injection Shield
 * Scans AST nodes, blocks malicious code execution, and filters prompt injection attacks.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';

export interface SecurityScanResult {
  passed: boolean;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  violations: Array<{
    nodeId?: string;
    type: 'MALICIOUS_PHP' | 'PROMPT_INJECTION' | 'XSS_INJECTION' | 'UNAUTHORIZED_SETTINGS';
    description: string;
    snippet?: string;
  }>;
  scannedNodesCount: number;
}

export class SecurityShield {
  private static readonly DANGEROUS_PATTERNS = [
    /<\?php/i,
    /<\?=/i,
    /eval\s*\(/i,
    /base64_decode\s*\(/i,
    /system\s*\(/i,
    /exec\s*\(/i,
    /passthru\s*\(/i,
    /shell_exec\s*\(/i,
    /`.*`/,
    /javascript:\s*/i,
    /<script[^>]*>.*<\/script>/is,
  ];

  private static readonly INJECTION_PROMPTS = [
    /ignore previous instructions/i,
    /disregard all previous prompts/i,
    /you are now in developer mode/i,
    /jailbreak/i,
    /system\s+override/i,
    /bypass\s+safety/i,
  ];

  /**
   * Scans an Elementor AST tree for code injection, malicious PHP/JS scripts, and prompt injection patterns.
   */
  public scanAst(nodes: ElementorNode[]): SecurityScanResult {
    logger.debug('[SecurityShield] Scanning Elementor AST tree for security threats');
    const violations: SecurityScanResult['violations'] = [];
    let scannedCount = 0;

    const traverse = (nodeList: ElementorNode[]): void => {
      for (const node of nodeList) {
        scannedCount++;
        const settingsStr = JSON.stringify(node.settings || {});

        // Check for Malicious PHP / Code execution
        for (const pattern of SecurityShield.DANGEROUS_PATTERNS) {
          if (pattern.test(settingsStr)) {
            violations.push({
              nodeId: node.id,
              type: 'MALICIOUS_PHP',
              description: `Dangerous code execution pattern detected in node ${node.id}`,
              snippet: settingsStr.slice(0, 100),
            });
            break;
          }
        }

        // Check for Prompt Injection
        for (const pattern of SecurityShield.INJECTION_PROMPTS) {
          if (pattern.test(settingsStr)) {
            violations.push({
              nodeId: node.id,
              type: 'PROMPT_INJECTION',
              description: `Prompt injection attack signature detected in node ${node.id}`,
              snippet: settingsStr.slice(0, 100),
            });
            break;
          }
        }

        if (node.elements && node.elements.length > 0) {
          traverse(node.elements);
        }
      }
    };

    traverse(nodes);

    const passed = violations.length === 0;
    let threatLevel: SecurityScanResult['threatLevel'] = 'NONE';

    if (violations.some((v) => v.type === 'MALICIOUS_PHP')) {
      threatLevel = 'CRITICAL';
    } else if (violations.some((v) => v.type === 'PROMPT_INJECTION')) {
      threatLevel = 'HIGH';
    } else if (violations.length > 0) {
      threatLevel = 'MEDIUM';
    }

    return {
      passed,
      threatLevel,
      violations,
      scannedNodesCount: scannedCount,
    };
  }

  /**
   * Scans raw text prompts for direct prompt injection before routing to LLM models.
   */
  public scanPrompt(prompt: string): { safe: boolean; reason?: string } {
    for (const pattern of SecurityShield.INJECTION_PROMPTS) {
      if (pattern.test(prompt)) {
        return { safe: false, reason: 'Prompt injection signature detected' };
      }
    }
    return { safe: true };
  }
}
