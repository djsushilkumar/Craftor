/**
 * Craftor AI Prompt Playground Component
 * Interactive UI for testing prompts, selecting LLM model backends, and viewing synthesized ASTs.
 */

import { ElementorNode } from '@craftor/shared-types';
import { PromptExecutionResult } from '../types.js';

export class PromptPlayground {
  private executionHistory: PromptExecutionResult[] = [];

  public recordExecution(result: PromptExecutionResult): void {
    this.executionHistory.unshift(result);
    if (this.executionHistory.length > 50) {
      this.executionHistory.pop();
    }
  }

  public getHistory(): PromptExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Generates a sample AST layout response for demonstration in playground sandbox.
   */
  public simulateSynthesis(prompt: string, model = 'llama3:8b'): PromptExecutionResult {
    const mockAst: ElementorNode[] = [
      {
        id: 'cnt_hero_1',
        elType: 'container',
        settings: {
          flex_direction: 'column',
          align_items: 'center',
          justify_content: 'center',
          background_background: 'classic',
          background_color: '#1E1B4B',
          padding: '2rem',
        },
        elements: [
          {
            id: 'hdg_title_1',
            elType: 'widget',
            widgetType: 'heading',
            settings: { title: `AI Generated: ${prompt}`, align: 'center' },
            elements: [],
          },
          {
            id: 'txt_sub_1',
            elType: 'widget',
            widgetType: 'text-editor',
            settings: { editor: 'Synthesized with 100% WCAG AA contrast compliance and Elementor Flex container nesting.' },
            elements: [],
          },
          {
            id: 'btn_cta_1',
            elType: 'widget',
            widgetType: 'button',
            settings: { text: 'Explore Architecture', align: 'center' },
            elements: [],
          },
        ],
      },
    ];

    const result: PromptExecutionResult = {
      prompt,
      model,
      provider: model.includes('llama') || model.includes('mistral') ? 'local_ollama' : 'anthropic_claude',
      durationMs: 38,
      tokensUsed: 284,
      ast: mockAst,
      rawResponse: JSON.stringify(mockAst, null, 2),
    };

    this.recordExecution(result);
    return result;
  }

  public renderHtml(): string {
    return `
      <div class="prompt-playground-panel" style="background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(75, 85, 99, 0.4); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="margin-top: 0; color: #F9FAFB; font-size: 1.2rem; font-weight: 600;">AI Prompt Playground & AST Synthesizer</h3>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <input type="text" id="playground-prompt-input" placeholder="e.g. Modern SaaS Hero with 2 split columns and primary CTA" value="Modern SaaS Hero with 2 split columns and primary CTA" style="background: #1F2937; border: 1px solid #374151; color: #F9FAFB; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.95rem; width: 100%; box-sizing: border-box;" />
          <select id="playground-model-select" style="background: #1F2937; border: 1px solid #374151; color: #F9FAFB; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.95rem;">
            <option value="llama3:8b">Local Ollama (Llama 3 8B)</option>
            <option value="mistral:7b">Local vLLM (Mistral 7B)</option>
            <option value="claude-3-5-sonnet">Anthropic (Claude 3.5 Sonnet)</option>
            <option value="gpt-4o">OpenAI (GPT-4o)</option>
          </select>
        </div>
        <button id="playground-synthesize-btn" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFF; font-weight: 600; padding: 0.75rem 1.75rem; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
          ✨ Synthesize Elementor AST
        </button>
      </div>
    `;
  }
}
