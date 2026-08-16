import { McpToolDefinition } from '../../shared-types/src/index';
export declare class ToolRegistry {
    private static tools;
    static register(tool: McpToolDefinition): void;
    static get(id: string): McpToolDefinition | undefined;
    static list(): McpToolDefinition[];
    static count(): number;
}
//# sourceMappingURL=index.d.ts.map