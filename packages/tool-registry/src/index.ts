import { McpToolDefinition } from '../../shared-types/dist/index';

export class ToolRegistry {
  private static tools: Map<string, McpToolDefinition> = new Map();

  public static register(tool: McpToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  public static get(id: string): McpToolDefinition | undefined {
    return this.tools.get(id);
  }

  public static list(): McpToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public static count(): number {
    return this.tools.size;
  }
}
