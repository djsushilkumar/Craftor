export interface WorkflowStep {
  id: string;
  toolId: string;
  inputs: Record<string, unknown>;
  rollbackOnFailure?: boolean;
}

export interface CraftorWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export class WorkflowRegistry {
  private static workflows: Map<string, CraftorWorkflow> = new Map();

  public static register(workflow: CraftorWorkflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  public static get(id: string): CraftorWorkflow | undefined {
    return this.workflows.get(id);
  }

  public static list(): CraftorWorkflow[] {
    return Array.from(this.workflows.values());
  }
}
