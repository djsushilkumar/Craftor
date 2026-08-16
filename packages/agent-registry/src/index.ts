import { CraftorSkill } from '../../skill-registry/dist/index';

export interface CraftorAgentPersona {
  id: string;
  name: string;
  role: string;
  boundSkills: CraftorSkill[];
  guardrails: Record<string, unknown>;
  isActive: boolean;
}

export class AgentRegistry {
  private static agents: Map<string, CraftorAgentPersona> = new Map();

  public static register(agent: CraftorAgentPersona): void {
    this.agents.set(agent.id, agent);
  }

  public static get(id: string): CraftorAgentPersona | undefined {
    return this.agents.get(id);
  }

  public static list(): CraftorAgentPersona[] {
    return Array.from(this.agents.values());
  }
}
