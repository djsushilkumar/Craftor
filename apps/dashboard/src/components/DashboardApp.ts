/**
 * Craftor Web Studio & Cloud Control Plane Application
 * Assembles SiteMonitor, AstCanvasRenderer, PromptPlayground, and PaletteManager into a complete HTML5 interface.
 */

import { SiteMonitor } from './SiteMonitor.js';
import { AstCanvasRenderer } from './AstCanvasRenderer.js';
import { PromptPlayground } from './PromptPlayground.js';
import { PaletteManager } from './PaletteManager.js';
import { VoiceStudio } from './VoiceStudio.js';
import { ElementorNode } from '@craftor/shared-types';

export class DashboardApp {
  private siteMonitor = new SiteMonitor();
  private canvasRenderer = new AstCanvasRenderer();
  private playground = new PromptPlayground();
  private paletteManager = new PaletteManager();
  private voiceStudio = new VoiceStudio();

  public getSiteMonitor(): SiteMonitor {
    return this.siteMonitor;
  }

  public getCanvasRenderer(): AstCanvasRenderer {
    return this.canvasRenderer;
  }

  public getPlayground(): PromptPlayground {
    return this.playground;
  }

  public getPaletteManager(): PaletteManager {
    return this.paletteManager;
  }

  public getVoiceStudio(): VoiceStudio {
    return this.voiceStudio;
  }

  /**
   * Generates the complete, self-contained, responsive HTML5 Web App Studio interface.
   */
  public renderFullPage(initialAst?: ElementorNode[]): string {
    const demoAst = initialAst ?? [
      {
        id: 'hero_sec_001',
        elType: 'container',
        settings: {
          flex_direction: 'column',
          align_items: 'center',
          justify_content: 'center',
          background_background: 'classic',
          background_color: '#111827',
          padding: '2.5rem',
        },
        elements: [
          {
            id: 'hdg_main_001',
            elType: 'widget',
            widgetType: 'heading',
            settings: { title: 'Craftor Autonomous AI Studio', align: 'center' },
            elements: [],
          },
          {
            id: 'txt_lead_001',
            elType: 'widget',
            widgetType: 'text-editor',
            settings: { editor: 'Real-time Elementor AST Canvas live-syncing across 8 AI clients with micro-rollbacks.' },
            elements: [],
          },
          {
            id: 'btn_hero_001',
            elType: 'widget',
            widgetType: 'button',
            settings: { text: 'Open Live Elementor Canvas', align: 'center' },
            elements: [],
          },
        ],
      },
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Craftor SaaS Control Plane & Visual Web Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0B0F17;
      --bg-surface: rgba(17, 24, 39, 0.75);
      --border-subtle: rgba(75, 85, 99, 0.35);
      --text-main: #F9FAFB;
      --text-muted: #9CA3AF;
      --accent-indigo: #4F46E5;
      --accent-emerald: #10B981;
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg-primary);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    header {
      background: rgba(11, 15, 23, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .main-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
</head>
<body>
  <header>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #4F46E5, #7C3AED); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">C</div>
      <h1 style="margin: 0; font-size: 1.25rem; font-family: 'Outfit', sans-serif; font-weight: 700;">Craftor AI Studio</h1>
    </div>
    <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.85rem;">
      <span style="color: #10B981;">● 86 MCP Tools Active</span>
      <span style="color: #9CA3AF;">|</span>
      <span style="color: #818CF8;">8 AI Clients Ready</span>
      <span style="color: #9CA3AF;">|</span>
      <span style="color: #F59E0B;">Production 1.0 GA Certified</span>
    </div>
  </header>

  <main class="main-container">
    <section style="margin-bottom: 2.5rem;">
      <div class="section-title">🌐 Connected WordPress Instances</div>
      ${this.siteMonitor.renderHtml()}
    </section>

    <section style="margin-bottom: 2.5rem;">
      <div class="section-title">🎙️ Conversational AI Voice Studio</div>
      ${this.voiceStudio.renderVoiceStudio()}
    </section>

    <section style="margin-bottom: 2.5rem;">
      <div class="section-title">⚡ AI Prompt Playground & Visual AST Canvas</div>
      ${this.playground.renderHtml()}
      ${this.canvasRenderer.renderCanvas(demoAst, 'desktop')}
    </section>

    <section>
      <div class="section-title">🎨 Global Kit & Brand Palettes</div>
      ${this.paletteManager.renderHtml()}
    </section>
  </main>
</body>
</html>`;
  }
}
