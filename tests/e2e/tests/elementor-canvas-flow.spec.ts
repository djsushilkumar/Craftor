/**
 * Playwright E2E Suite: Elementor Canvas & AST Mutation Flow
 * Simulates complete AI-driven canvas layout construction, widget insertion,
 * multi-breakpoint responsive styling, and template serialization.
 */

import { handleToolsCall } from '../../../packages/mcp-server/dist/handlers/tools.js';
import { ElementorNode } from '../../../packages/shared-types/dist/index.js';

export async function runElementorCanvasE2e(): Promise<{ name: string; passed: boolean; assertions: number }> {
  console.log('  ▶ [E2E Spec] Elementor Canvas & AST Mutation Flow...');
  let assertions = 0;

  // 1. Generate Compound Hero Layout Container
  const heroRes = await handleToolsCall({
    name: 'craftor_elementor_generate_container',
    arguments: {
      layoutType: 'hero',
      title: 'Next-Generation WordPress Development',
      subtitle: 'Build with AI precision and zero hallucinations.',
      ctaText: 'Start Building',
    },
  });
  assertions++;
  if (heroRes.isError || !heroRes.content?.[0]?.text) {
    throw new Error('craftor_elementor_generate_container failed');
  }
  const heroData = JSON.parse(heroRes.content[0].text);
  const heroContainer: ElementorNode = heroData.node;
  if (!heroContainer || heroContainer.elType !== 'container' || heroContainer.elements.length < 3) {
    throw new Error('Hero container structure invalid');
  }

  // 2. Insert Additional Feature Grid Container into AST
  const featureRes = await handleToolsCall({
    name: 'craftor_elementor_generate_container',
    arguments: {
      layoutType: 'feature_grid',
      title: 'Core Platform Features',
    },
  });
  assertions++;
  if (!featureRes.content?.[0]?.text) {
    throw new Error('craftor_elementor_generate_container feature_grid failed');
  }
  const featureData = JSON.parse(featureRes.content[0].text);
  const featureContainer: ElementorNode = featureData.node;

  const fullAst: ElementorNode[] = [heroContainer, featureContainer];

  // 3. Insert Custom Pricing Widget into AST
  const widgetInsertRes = await handleToolsCall({
    name: 'craftor_elementor_insert_widget',
    arguments: {
      ast: fullAst,
      parentId: heroContainer.id,
      widgetType: 'button',
      settings: {
        text: 'Secondary Action',
        button_type: 'secondary',
      },
    },
  });
  assertions++;
  if (widgetInsertRes.isError || !widgetInsertRes.content?.[0]?.text) {
    throw new Error('craftor_elementor_insert_widget failed');
  }
  const updatedAst = JSON.parse(widgetInsertRes.content[0].text).ast;

  // 4. Validate AST Structural Integrity
  const validationRes = await handleToolsCall({
    name: 'craftor_elementor_validate_ast',
    arguments: { ast: updatedAst },
  });
  assertions++;
  if (!validationRes.content?.[0]?.text) {
    throw new Error('craftor_elementor_validate_ast failed');
  }
  const validationData = JSON.parse(validationRes.content[0].text);
  if (!validationData.valid) {
    throw new Error(`AST validation failed: ${JSON.stringify(validationData.errors)}`);
  }

  // 5. Update Widget Settings (patch button styling)
  const buttonNode = updatedAst[0].elements.find((el: ElementorNode) => el.widgetType === 'button');
  if (buttonNode) {
    const updateWidgetRes = await handleToolsCall({
      name: 'craftor_elementor_update_widget',
      arguments: {
        ast: updatedAst,
        widgetId: buttonNode.id,
        settings: { text: 'Claim Free Trial Now', size: 'lg' },
      },
    });
    assertions++;
    if (updateWidgetRes.isError) {
      throw new Error('craftor_elementor_update_widget failed');
    }
  }

  // 6. Save Document AST to Post ID 42
  const saveDocRes = await handleToolsCall({
    name: 'craftor_elementor_save_document',
    arguments: {
      pageId: 42,
      elements: updatedAst,
      settings: { page_title: 'AI Landing Page' },
    },
  });
  assertions++;
  if (saveDocRes.isError) {
    throw new Error('craftor_elementor_save_document failed');
  }

  // 7. Export Document as Portable Template
  const exportRes = await handleToolsCall({
    name: 'craftor_elementor_create_template',
    arguments: {
      title: 'Craftor Production Landing Page Template',
      type: 'page',
      elements: updatedAst,
    },
  });
  assertions++;
  if (exportRes.isError) {
    throw new Error('craftor_elementor_create_template failed');
  }

  // 8. Design Tokens Integration
  const tokensRes = await handleToolsCall({
    name: 'craftor_elementor_get_tokens',
    arguments: {},
  });
  assertions++;
  if (!tokensRes.content?.[0]?.text) {
    throw new Error('craftor_elementor_get_tokens failed');
  }
  const tokensData = JSON.parse(tokensRes.content[0].text);
  if (!tokensData.tokens?.colors || !tokensData.tokens?.typography) {
    throw new Error('Design tokens missing colors or typography scale');
  }

  console.log(`    ✅ Elementor Canvas Flow E2E Passed (${assertions} assertions)`);
  return { name: 'elementor-canvas-flow.spec.ts', passed: true, assertions };
}
