'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SkillRegistry = void 0;
class SkillRegistry {
  static skills = new Map();
  static register(skill) {
    this.skills.set(skill.id, skill);
  }
  static get(id) {
    return this.skills.get(id);
  }
  static list() {
    return Array.from(this.skills.values());
  }
}
exports.SkillRegistry = SkillRegistry;
//# sourceMappingURL=index.js.map
