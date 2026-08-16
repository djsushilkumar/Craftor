'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ToolRegistry = void 0;
class ToolRegistry {
  static tools = new Map();
  static register(tool) {
    this.tools.set(tool.id, tool);
  }
  static get(id) {
    return this.tools.get(id);
  }
  static list() {
    return Array.from(this.tools.values());
  }
  static count() {
    return this.tools.size;
  }
}
exports.ToolRegistry = ToolRegistry;
//# sourceMappingURL=index.js.map
