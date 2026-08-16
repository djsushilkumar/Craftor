export interface CraftorSkill {
  id: string;
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
  evalAccuracy: number;
}

export class SkillRegistry {
  private static skills: Map<string, CraftorSkill> = new Map();

  public static register(skill: CraftorSkill): void {
    this.skills.set(skill.id, skill);
  }

  public static get(id: string): CraftorSkill | undefined {
    return this.skills.get(id);
  }

  public static list(): CraftorSkill[] {
    return Array.from(this.skills.values());
  }
}
