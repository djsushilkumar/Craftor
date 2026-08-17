import { McpPromptDefinition, McpPromptMessage } from '../../../shared-types/dist/index.js';
import { createInvalidParamsError, createPromptNotFoundError } from '../errors.js';

export interface PromptsListResponsePayload {
  prompts: McpPromptDefinition[];
}

export interface PromptsGetResponsePayload {
  description?: string;
  messages: McpPromptMessage[];
}

export class PromptRegistry {
  private static prompts: Map<string, McpPromptDefinition> = new Map();

  public static register(prompt: McpPromptDefinition): void {
    this.prompts.set(prompt.name, prompt);
  }

  public static get(name: string): McpPromptDefinition | undefined {
    return this.prompts.get(name);
  }

  public static list(): McpPromptDefinition[] {
    return Array.from(this.prompts.values());
  }

  public static initDefaults(): void {
    const defaults: McpPromptDefinition[] = [
      {
        name: 'generate_landing_page',
        description:
          'Generates a complete, responsive Elementor Flex Container landing page with Hero, Features, and CTA.',
        arguments: [
          {
            name: 'topic',
            description: 'The business niche or topic of the landing page (e.g. "SaaS AI Tool")',
            required: true,
          },
          {
            name: 'style',
            description: 'Design aesthetic (e.g. "modern dark mode with neon accents")',
            required: false,
          },
        ],
      },
      {
        name: 'audit_elementor_page',
        description:
          'Analyzes an Elementor AST structure for responsive flex/grid issues, WCAG contrast compliance, and performance bottlenecks.',
        arguments: [
          {
            name: 'astJson',
            description: 'Raw JSON string of the Elementor AST tree',
            required: true,
          },
        ],
      },
      {
        name: 'create_woocommerce_product',
        description:
          'Creates a full WooCommerce product card layout featuring dynamic tags, gallery, pricing badge, and add-to-cart button.',
        arguments: [
          {
            name: 'productName',
            description: 'Name of the e-commerce product',
            required: true,
          },
          {
            name: 'price',
            description: 'Product price formatted as string or number',
            required: true,
          },
        ],
      },
      {
        name: 'repair_elementor_ast',
        description:
          'Validates and automatically repairs broken element UUIDs, missing container attributes, and malformed widget settings.',
        arguments: [
          {
            name: 'corruptedAst',
            description: 'The malformed Elementor AST JSON to repair',
            required: true,
          },
        ],
      },
    ];

    for (const p of defaults) {
      if (!this.prompts.has(p.name)) {
        this.register(p);
      }
    }
  }
}

export async function handlePromptsList(
  _params?: Record<string, unknown>,
): Promise<PromptsListResponsePayload> {
  PromptRegistry.initDefaults();
  return {
    prompts: PromptRegistry.list(),
  };
}

export async function handlePromptsGet(params: unknown): Promise<PromptsGetResponsePayload> {
  PromptRegistry.initDefaults();

  if (typeof params !== 'object' || params === null) {
    throw createInvalidParamsError('params must be a valid JSON object');
  }

  const raw = params as Record<string, unknown>;
  const name = raw.name;
  if (typeof name !== 'string' || !name.trim()) {
    throw createInvalidParamsError('Missing or empty "name" parameter in prompts/get request');
  }

  const prompt = PromptRegistry.get(name);
  if (!prompt) {
    throw createPromptNotFoundError(name);
  }

  const args = (
    typeof raw.arguments === 'object' && raw.arguments !== null
      ? (raw.arguments as Record<string, unknown>)
      : {}
  ) as Record<string, unknown>;

  const messages: McpPromptMessage[] = [];

  switch (name) {
    case 'generate_landing_page': {
      const topic = String(args.topic ?? 'Modern SaaS Application');
      const style = String(args.style ?? 'sleek dark mode with glassmorphism and subtle gradients');

      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `You are the Lead Elementor Design Engineer for Craftor. Build a complete, responsive Elementor landing page for "${topic}" using modern Flexbox Containers. Design style: "${style}".\n\nEnsure all container elements use 7-character hex IDs and strict Draft-07 schema compliance. Use tool "craftor_elementor_create_container" and "craftor_elementor_insert_node".`,
        },
      });
      break;
    }

    case 'audit_elementor_page': {
      const astJson = String(args.astJson ?? '[]');
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Audit the following Elementor AST for layout correctness, missing settings, and WCAG AA color accessibility:\n\n\`\`\`json\n${astJson}\n\`\`\`\n\nRun validation using "craftor_elementor_validate_ast" and output a structured report.`,
        },
      });
      break;
    }

    case 'create_woocommerce_product': {
      const productName = String(args.productName ?? 'Sample Product');
      const price = String(args.price ?? '$49.00');
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Design a high-converting WooCommerce product container for "${productName}" priced at ${price}. Include product image container, heading widget, price badge, short description, and an add-to-cart button.`,
        },
      });
      break;
    }

    case 'repair_elementor_ast': {
      const corruptedAst = String(args.corruptedAst ?? '{}');
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Inspect and repair the following corrupted Elementor AST document. Ensure every container and widget has valid unique 7-hex IDs, correct "elType", and non-null settings:\n\n\`\`\`json\n${corruptedAst}\n\`\`\``,
        },
      });
      break;
    }

    default: {
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Execute prompt "${name}" with parameters: ${JSON.stringify(args)}`,
        },
      });
      break;
    }
  }

  return {
    description: prompt.description,
    messages,
  };
}
