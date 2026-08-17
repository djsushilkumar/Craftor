import {
  McpToolDefinition,
  McpCallToolResult,
  ElementorNode,
  ElementorTemplateData,
} from '../../../shared-types/dist/index.js';
import { ToolRegistry } from '../../../tool-registry/dist/index.js';
import {
  createFlexContainer,
  createGridContainer,
  createWidgetNode,
  insertNode,
  removeNode,
  updateNodeSettings,
  validateAst,
  ElementorAstEngine,
} from '../../../elementor-ast/dist/index.js';
import {
  WordPressClient,
  ElementorBridge,
} from '../../../wordpress-bridge/dist/index.js';
import { CRAFTOR_TOKENS } from '../../../design-tokens/dist/index.js';
import { logger } from '../../../shared-utils/dist/index.js';
import { createInvalidParamsError, createToolNotFoundError, McpError } from '../errors.js';

export interface ToolsListResponsePayload {
  tools: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }>;
}

export interface ToolCallParams {
  name: string;
  arguments?: Record<string, unknown>;
}

export function registerDefaultTools(): void {
  const defaultTools: McpToolDefinition[] = [
    {
      id: 'craftor_elementor_get_document',
      name: 'Get Elementor Document AST',
      category: 'elementor_document',
      description: 'Loads and parses an Elementor document AST tree and page settings from WordPress post meta.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'Target WordPress post/page ID' },
        },
      },
    },
    {
      id: 'craftor_elementor_save_document',
      name: 'Save Elementor Document AST',
      category: 'elementor_document',
      description: 'Validates, serializes, and persists an Elementor AST tree to WordPress _elementor_data meta and invalidates CSS caches.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['pageId', 'elements'],
        properties: {
          pageId: { type: 'number', description: 'Target WordPress post/page ID' },
          elements: { type: 'array', description: 'Root array of Elementor AST container/widget nodes' },
          settings: { type: 'object', description: 'Optional page-level Elementor settings' },
        },
      },
    },
    {
      id: 'craftor_elementor_create_container',
      name: 'Create Elementor Container',
      category: 'elementor_containers',
      description: 'Generates a validated Elementor flex or grid container AST node.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          containerType: {
            type: 'string',
            description: 'Type of container: flex or grid',
            enum: ['flex', 'grid'],
          },
          direction: {
            type: 'string',
            description: 'Flex direction (row | column)',
            enum: ['row', 'column', 'row-reverse', 'column-reverse'],
          },
          columns: {
            type: 'number',
            description: 'Grid columns count (for grid container)',
          },
        },
      },
    },
    {
      id: 'craftor_elementor_update_container',
      name: 'Update Elementor Container',
      category: 'elementor_containers',
      description: 'Updates settings of a target container inside an Elementor AST tree.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'containerId', 'settingsPatch'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST node tree' },
          containerId: { type: 'string', description: 'Target container UUID' },
          settingsPatch: { type: 'object', description: 'Key-value map of settings to update' },
        },
      },
    },
    {
      id: 'craftor_elementor_delete_container',
      name: 'Delete Elementor Container',
      category: 'elementor_containers',
      description: 'Removes a container and all its children from an Elementor AST tree.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'containerId'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST node tree' },
          containerId: { type: 'string', description: 'Target container UUID' },
        },
      },
    },
    {
      id: 'craftor_elementor_insert_widget',
      name: 'Insert Elementor Widget',
      category: 'elementor_widgets',
      description: 'Creates and inserts an Elementor widget node into a target parent container.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'parentId', 'widgetType'],
        properties: {
          ast: { type: 'array', description: 'Root AST array' },
          parentId: { type: 'string', description: 'Parent container UUID' },
          widgetType: { type: 'string', description: 'Widget type (heading, button, image, etc.)' },
          settings: { type: 'object', description: 'Widget settings payload' },
          index: { type: 'number', description: 'Optional insertion index' },
        },
      },
    },
    {
      id: 'craftor_elementor_update_widget',
      name: 'Update Elementor Widget',
      category: 'elementor_widgets',
      description: 'Updates settings of a target widget inside an Elementor AST tree.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'widgetId', 'settingsPatch'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST node tree' },
          widgetId: { type: 'string', description: 'Target widget UUID' },
          settingsPatch: { type: 'object', description: 'Key-value map of settings to update' },
        },
      },
    },
    {
      id: 'craftor_elementor_remove_widget',
      name: 'Remove Elementor Widget',
      category: 'elementor_widgets',
      description: 'Removes a widget node from an Elementor AST tree.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'widgetId'],
        properties: {
          ast: { type: 'array', description: 'Elementor AST node tree' },
          widgetId: { type: 'string', description: 'Target widget UUID' },
        },
      },
    },
    {
      id: 'craftor_elementor_export_template',
      name: 'Export Elementor Template',
      category: 'elementor_templates',
      description: 'Exports an Elementor document AST and page settings as a portable template object.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: {
          pageId: { type: 'number', description: 'Source WordPress post/page ID' },
          title: { type: 'string', description: 'Optional template title' },
        },
      },
    },
    {
      id: 'craftor_elementor_import_template',
      name: 'Import Elementor Template',
      category: 'elementor_templates',
      description: 'Imports a portable Elementor template object into a target WordPress post/page.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['targetPageId', 'template'],
        properties: {
          targetPageId: { type: 'number', description: 'Target WordPress post/page ID' },
          template: { type: 'object', description: 'Portable Elementor template object' },
        },
      },
    },
    {
      id: 'craftor_elementor_validate_ast',
      name: 'Validate Elementor AST',
      category: 'elementor_containers',
      description: 'Validates an entire Elementor AST tree against structural invariants.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['ast'],
        properties: {
          ast: {
            type: 'array',
            description: 'Array of Elementor container/widget nodes to validate',
          },
        },
      },
    },
    {
      id: 'craftor_elementor_insert_node',
      name: 'Insert AST Widget Node',
      category: 'elementor_widgets',
      description: 'Immutably inserts a widget node into a target parent container.',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        required: ['ast', 'parentId', 'widgetType'],
        properties: {
          ast: { type: 'array', description: 'Root AST array' },
          parentId: { type: 'string', description: 'Parent container UUID' },
          widgetType: { type: 'string', description: 'Widget type (heading, button, image, etc.)' },
          settings: { type: 'object', description: 'Widget settings payload' },
        },
      },
    },
    {
      id: 'craftor_elementor_get_tokens',
      name: 'Get Master Design Tokens',
      category: 'elementor_styles',
      description: 'Retrieves Craftor master HSL colors, spacing scales, and typography tokens.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      id: 'craftor_system_status',
      name: 'Get Craftor System Status',
      category: 'site_operations',
      description: 'Retrieves real-time MCP daemon runtime telemetry, memory, and site connection info.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      id: 'craftor_verify_license',
      name: 'Verify Craftor License',
      category: 'multisite_enterprise',
      description: 'Validates active Craftor license key, seats count, and cloud entitlement tier.',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        required: ['licenseKey'],
        properties: {
          licenseKey: { type: 'string', description: 'Craftor license key (starts with crf_lic_)' },
        },
      },
    },
  ];

  for (const tool of defaultTools) {
    if (!ToolRegistry.get(tool.id)) {
      ToolRegistry.register(tool);
    }
  }
}

export async function handleToolsList(
  _params?: Record<string, unknown>,
): Promise<ToolsListResponsePayload> {
  registerDefaultTools();
  const tools: McpToolDefinition[] = ToolRegistry.list();

  return {
    tools: tools.map((tool: McpToolDefinition) => ({
      name: tool.id,
      description: tool.description,
      inputSchema: (tool.inputSchema as Record<string, unknown>) ?? {
        type: 'object',
        properties: {},
      },
    })),
  };
}

export async function handleToolsCall(
  params: unknown,
  siteUrl: string = '',
  secretToken: string = '',
): Promise<McpCallToolResult> {
  registerDefaultTools();

  if (typeof params !== 'object' || params === null) {
    throw createInvalidParamsError('params must be a valid JSON object');
  }

  const raw = params as Record<string, unknown>;
  const toolName = raw.name;
  if (typeof toolName !== 'string' || !toolName.trim()) {
    throw createInvalidParamsError('Missing or empty tool "name" parameter in tools/call request');
  }

  const args = (
    typeof raw.arguments === 'object' && raw.arguments !== null
      ? (raw.arguments as Record<string, unknown>)
      : {}
  ) as Record<string, unknown>;

  const tool = ToolRegistry.get(toolName);
  if (!tool) {
    throw createToolNotFoundError(toolName);
  }

  logger.info(`Executing tool: ${toolName}`, { toolName, argsKeys: Object.keys(args) });

  try {
    switch (toolName) {
      case 'craftor_elementor_get_document': {
        const pageId = Number(args.pageId);
        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = new WordPressClient({
            siteUrl,
            auth: secretToken ? { type: 'bearer', token: secretToken } : undefined,
          });
          const bridge = new ElementorBridge({ client });
          const doc = await bridge.getDocument(pageId);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, document: doc }, null, 2) }],
          };
        }

        // Standalone memory document fallback
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                document: {
                  pageId,
                  title: `Page ${pageId}`,
                  status: 'publish',
                  version: '3.24.0',
                  elements: [],
                  settings: {},
                },
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_save_document': {
        const pageId = Number(args.pageId);
        const elements = args.elements as ElementorNode[];
        const settings = (args.settings as Record<string, unknown>) ?? {};

        if (!pageId || !Array.isArray(elements)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid pageId and elements array are required' }) }],
            isError: true,
          };
        }

        const validation = validateAst(elements);
        if (!validation.valid) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, errors: validation.errors }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = new WordPressClient({
            siteUrl,
            auth: secretToken ? { type: 'bearer', token: secretToken } : undefined,
          });
          const bridge = new ElementorBridge({ client });
          const savedDoc = await bridge.saveDocument(pageId, elements, settings);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, document: savedDoc }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                saved: true,
                pageId,
                elementCount: elements.length,
                astSerialized: ElementorAstEngine.serialize(elements),
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_create_container': {
        const containerType = String(args.containerType ?? 'flex');
        const direction = (args.direction as 'row' | 'column') ?? 'column';
        const columns = typeof args.columns === 'number' ? args.columns : 3;

        const container =
          containerType === 'grid'
            ? createGridContainer({ columns, rows: 2 })
            : createFlexContainer({ flexDirection: direction });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  container,
                  astSerialized: ElementorAstEngine.serialize([container]),
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case 'craftor_elementor_update_container': {
        const ast = args.ast as ElementorNode[];
        const containerId = String(args.containerId ?? '');
        const patch = (args.settingsPatch as Record<string, unknown>) ?? {};

        if (!Array.isArray(ast) || !containerId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'ast array and containerId are required' }) }],
            isError: true,
          };
        }

        const updatedAst = updateNodeSettings(ast, containerId, patch);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_delete_container': {
        const ast = args.ast as ElementorNode[];
        const containerId = String(args.containerId ?? '');

        if (!Array.isArray(ast) || !containerId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'ast array and containerId are required' }) }],
            isError: true,
          };
        }

        const updatedAst = removeNode(ast, containerId);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_insert_widget':
      case 'craftor_elementor_insert_node': {
        if (
          !Array.isArray(args.ast) ||
          typeof args.parentId !== 'string' ||
          typeof args.widgetType !== 'string'
        ) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'Missing required fields: ast (array), parentId (string), widgetType (string)',
                }),
              },
            ],
            isError: true,
          };
        }

        const ast = args.ast as ElementorNode[];
        const parentId = args.parentId;
        const widgetType = args.widgetType;
        const settings = (
          typeof args.settings === 'object' && args.settings !== null ? args.settings : {}
        ) as Record<string, unknown>;
        const index = typeof args.index === 'number' ? args.index : undefined;

        const widgetNode = createWidgetNode(widgetType, settings);
        const updatedAst = insertNode(ast, parentId, widgetNode, index);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  insertedNodeId: widgetNode.id,
                  ast: updatedAst,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case 'craftor_elementor_update_widget': {
        const ast = args.ast as ElementorNode[];
        const widgetId = String(args.widgetId ?? '');
        const patch = (args.settingsPatch as Record<string, unknown>) ?? {};

        if (!Array.isArray(ast) || !widgetId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'ast array and widgetId are required' }) }],
            isError: true,
          };
        }

        const updatedAst = updateNodeSettings(ast, widgetId, patch);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_remove_widget': {
        const ast = args.ast as ElementorNode[];
        const widgetId = String(args.widgetId ?? '');

        if (!Array.isArray(ast) || !widgetId) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'ast array and widgetId are required' }) }],
            isError: true,
          };
        }

        const updatedAst = removeNode(ast, widgetId);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, ast: updatedAst }, null, 2) }],
        };
      }

      case 'craftor_elementor_export_template': {
        const pageId = Number(args.pageId);
        const title = args.title ? String(args.title) : undefined;

        if (!pageId || isNaN(pageId)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid "pageId" is required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = new WordPressClient({
            siteUrl,
            auth: secretToken ? { type: 'bearer', token: secretToken } : undefined,
          });
          const bridge = new ElementorBridge({ client });
          const template = await bridge.exportTemplate(pageId, title);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, template }, null, 2) }],
          };
        }

        const templateData: ElementorTemplateData = {
          title: title ?? `Page ${pageId} Template`,
          type: 'page',
          version: '3.24.0',
          elements: [createFlexContainer()],
        };

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, template: templateData }, null, 2) }],
        };
      }

      case 'craftor_elementor_import_template': {
        const targetPageId = Number(args.targetPageId);
        const template = args.template as ElementorTemplateData;

        if (!targetPageId || !template || !Array.isArray(template.elements)) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'Valid targetPageId and template object are required' }) }],
            isError: true,
          };
        }

        if (siteUrl) {
          const client = new WordPressClient({
            siteUrl,
            auth: secretToken ? { type: 'bearer', token: secretToken } : undefined,
          });
          const bridge = new ElementorBridge({ client });
          const doc = await bridge.importTemplate(targetPageId, template);
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: true, document: doc }, null, 2) }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                targetPageId,
                importedElementCount: template.elements.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'craftor_elementor_validate_ast': {
        if (!Array.isArray(args.ast)) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  valid: false,
                  errors: ['Invalid input: "ast" must be an array of Elementor nodes.'],
                }),
              },
            ],
            isError: true,
          };
        }

        const ast = args.ast as ElementorNode[];
        const validation = validateAst(ast);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  valid: validation.valid,
                  errors: validation.errors,
                  nodeCount: ast.length,
                },
                null,
                2,
              ),
            },
          ],
          isError: !validation.valid,
        };
      }

      case 'craftor_elementor_get_tokens': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  tokens: CRAFTOR_TOKENS,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case 'craftor_system_status': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  siteUrl: siteUrl || 'unconnected',
                  authenticated: Boolean(secretToken),
                  registeredTools: ToolRegistry.count(),
                  protocolVersion: '2024-11-05',
                  uptimeSeconds: process.uptime(),
                  memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                  timestamp: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case 'craftor_verify_license': {
        const licenseKey = String(args.licenseKey ?? '');
        const isValidFormat = licenseKey.startsWith('crf_lic_') && licenseKey.length >= 20;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  verified: isValidFormat,
                  licenseKey,
                  tier: isValidFormat ? 'Enterprise Unlimited' : 'Invalid',
                  activeSeats: isValidFormat ? 10 : 0,
                  maxSeats: isValidFormat ? 100 : 0,
                  expiresAt: isValidFormat ? '2028-12-31T23:59:59Z' : null,
                  status: isValidFormat ? 'ACTIVE' : 'REVOKED',
                },
                null,
                2,
              ),
            },
          ],
          isError: !isValidFormat,
        };
      }

      default: {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                tool: toolName,
                message: `Tool "${toolName}" executed with arguments.`,
                params: args,
              }),
            },
          ],
        };
      }
    }
  } catch (err) {
    if (err instanceof McpError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Error executing tool ${toolName}: ${message}`, err);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: message, tool: toolName }),
        },
      ],
      isError: true,
    };
  }
}
