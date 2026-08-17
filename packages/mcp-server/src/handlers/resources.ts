import { McpResourceDefinition, McpResourceContents } from '../../../shared-types/dist/index.js';
import { ToolRegistry } from '../../../tool-registry/dist/index.js';
import { CRAFTOR_TOKENS } from '../../../design-tokens/dist/index.js';
import { createInvalidParamsError, createResourceNotFoundError } from '../errors.js';

export interface ResourcesListResponsePayload {
  resources: McpResourceDefinition[];
}

export interface ResourcesReadResponsePayload {
  contents: McpResourceContents[];
}

export class ResourceRegistry {
  private static resources: Map<string, McpResourceDefinition> = new Map();

  public static register(resource: McpResourceDefinition): void {
    this.resources.set(resource.uri, resource);
  }

  public static get(uri: string): McpResourceDefinition | undefined {
    return this.resources.get(uri);
  }

  public static list(): McpResourceDefinition[] {
    return Array.from(this.resources.values());
  }

  public static initDefaults(): void {
    const defaults: McpResourceDefinition[] = [
      {
        uri: 'craftor://system/status',
        name: 'Craftor System & Runtime Status',
        description:
          'Real-time telemetry, memory metrics, connected WordPress site URL, and license state.',
        mimeType: 'application/json',
      },
      {
        uri: 'craftor://elementor/schema',
        name: 'Elementor AST Document Schema',
        description:
          'JSON schema definitions for Elementor Flex/Grid containers, widgets, and styles.',
        mimeType: 'application/json',
      },
      {
        uri: 'craftor://tokens/design',
        name: 'Craftor Master Design Tokens',
        description:
          'Master HSL color palette, typography hierarchy, spacing scale, and border radii.',
        mimeType: 'application/json',
      },
      {
        uri: 'craftor://tools/manifest',
        name: 'MCP Tools Catalog Manifest',
        description:
          'Full JSON catalog of all registered tools, descriptions, categories, and input schemas.',
        mimeType: 'application/json',
      },
    ];

    for (const res of defaults) {
      if (!this.resources.has(res.uri)) {
        this.register(res);
      }
    }
  }
}

export async function handleResourcesList(
  _params?: Record<string, unknown>,
): Promise<ResourcesListResponsePayload> {
  ResourceRegistry.initDefaults();
  return {
    resources: ResourceRegistry.list(),
  };
}

export async function handleResourcesRead(
  params: unknown,
  siteUrl: string = '',
  secretToken: string = '',
): Promise<ResourcesReadResponsePayload> {
  ResourceRegistry.initDefaults();

  if (typeof params !== 'object' || params === null) {
    throw createInvalidParamsError('params must be a valid JSON object');
  }

  const raw = params as Record<string, unknown>;
  const uri = raw.uri;
  if (typeof uri !== 'string' || !uri.trim()) {
    throw createInvalidParamsError('Missing or empty "uri" parameter in resources/read request');
  }

  const resource = ResourceRegistry.get(uri);
  if (!resource) {
    throw createResourceNotFoundError(uri);
  }

  let textContent = '';

  switch (uri) {
    case 'craftor://system/status': {
      textContent = JSON.stringify(
        {
          status: 'ONLINE',
          siteUrl: siteUrl || 'unconnected',
          authenticated: Boolean(secretToken),
          registeredToolsCount: ToolRegistry.count(),
          nodeVersion: process.version,
          platform: process.platform,
          uptimeSeconds: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      );
      break;
    }

    case 'craftor://elementor/schema': {
      textContent = JSON.stringify(
        {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'ElementorAstDocument',
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'elType', 'settings'],
            properties: {
              id: { type: 'string', pattern: '^[0-9a-f]{7}$' },
              elType: { type: 'string', enum: ['container', 'widget', 'section', 'column'] },
              isInner: { type: 'boolean' },
              widgetType: { type: 'string' },
              settings: { type: 'object' },
              elements: { type: 'array' },
            },
          },
        },
        null,
        2,
      );
      break;
    }

    case 'craftor://tokens/design': {
      textContent = JSON.stringify(CRAFTOR_TOKENS, null, 2);
      break;
    }

    case 'craftor://tools/manifest': {
      textContent = JSON.stringify(ToolRegistry.list(), null, 2);
      break;
    }

    default: {
      textContent = JSON.stringify({ uri, message: 'Resource data unavailable' });
      break;
    }
  }

  return {
    contents: [
      {
        uri,
        mimeType: resource.mimeType ?? 'application/json',
        text: textContent,
      },
    ],
  };
}
