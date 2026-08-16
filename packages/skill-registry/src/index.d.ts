export interface CraftorSkill {
  id: string;
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
  evalAccuracy: number;
}
export declare class SkillRegistry {
  private static skills;
  static register(skill: CraftorSkill): void;
  static get(id: string): CraftorSkill | undefined;
  static list(): CraftorSkill[];
}
//# sourceMappingURL=index.d.ts.map
