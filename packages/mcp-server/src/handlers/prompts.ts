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
        name: 'generate_elementor_homepage',
        description:
          'Generates a comprehensive multi-section Elementor Flex/Grid homepage with Hero, Features Grid, Testimonials, and Footer CTA.',
        arguments: [
          {
            name: 'brandName',
            description: 'Brand or business name',
            required: true,
          },
          {
            name: 'industry',
            description: 'Industry or niche (e.g., E-Commerce, Tech SaaS, Consulting)',
            required: true,
          },
        ],
      },
      {
        name: 'generate_elementor_landing_page',
        description:
          'Generates a high-converting Elementor landing page with Hero, Value Proposition, Pricing Table, and Action Button.',
        arguments: [
          {
            name: 'topic',
            description: 'The business niche or product of the landing page',
            required: true,
          },
          {
            name: 'style',
            description: 'Design aesthetic (e.g. "sleek dark mode with glassmorphism")',
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
        name: 'optimize_elementor_layout',
        description:
          'Optimizes DOM depth, reduces nested container redundancy, and enhances mobile responsiveness for an Elementor layout.',
        arguments: [
          {
            name: 'astJson',
            description: 'The Elementor AST JSON to optimize',
            required: true,
          },
        ],
      },
      {
        name: 'generate_landing_page',
        description: 'Alias for generate_elementor_landing_page',
        arguments: [
          { name: 'topic', description: 'Landing page topic', required: true },
        ],
      },
      {
        name: 'create_woocommerce_product',
        description:
          'Creates a full WooCommerce product card layout featuring dynamic tags, gallery, pricing badge, and add-to-cart button.',
        arguments: [
          { name: 'productName', description: 'Name of the e-commerce product', required: true },
          { name: 'price', description: 'Product price formatted as string or number', required: true },
        ],
      },
      {
        name: 'repair_elementor_ast',
        description:
          'Validates and automatically repairs broken element UUIDs, missing container attributes, and malformed widget settings.',
        arguments: [
          { name: 'corruptedAst', description: 'The malformed Elementor AST JSON to repair', required: true },
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
    case 'generate_elementor_homepage': {
      const brandName = String(args.brandName ?? 'Craftor Studio');
      const industry = String(args.industry ?? 'Technology');

      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `You are the Principal Elementor Architect for Craftor. Generate a modern multi-section homepage for "${brandName}" in the ${industry} industry.\n\nStructure:\n1. Hero Section (Flex row, headline, CTA button, hero image)\n2. Features 3-Column Grid Container\n3. Social Proof & Testimonials\n4. Final Full-Width CTA Banner\n\nUse tool "craftor_elementor_create_container" and "craftor_elementor_insert_widget" to construct and validate the AST.`,
        },
      });
      break;
    }

    case 'generate_elementor_landing_page':
    case 'generate_landing_page': {
      const topic = String(args.topic ?? 'Modern SaaS Application');
      const style = String(args.style ?? 'sleek dark mode with glassmorphism and subtle gradients');

      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `You are the Lead Elementor Design Engineer for Craftor. Build a complete, responsive Elementor landing page for "${topic}" using modern Flexbox Containers. Design style: "${style}".\n\nEnsure all container elements use 7-character hex IDs and strict Draft-07 schema compliance. Use tools "craftor_elementor_create_container", "craftor_elementor_insert_widget", and "craftor_elementor_save_document".`,
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

    case 'optimize_elementor_layout': {
      const astJson = String(args.astJson ?? '[]');
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Optimize the following Elementor AST to minimize DOM depth, remove empty wrappers, and convert legacy column structures to modern flexbox/grid containers:\n\n\`\`\`json\n${astJson}\n\`\`\``,
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
