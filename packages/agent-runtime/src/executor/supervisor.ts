/**
 * Craftor Execution Supervisor
 * Deterministic DAG runner with dynamic argument interpolation, pre-state snapshots, and human approval gateways.
 */

import { logger } from '@craftor/shared-utils';
import { VisualVerifier } from '@craftor/visual-intelligence';
import {
  ExecutionPlan,
  PlanTask,
  TaskExecutionEvent,
  ExecutionJournalEntry,
} from '../types.js';

export type ToolDispatcher = (toolName: string, args: Record<string, unknown>) => Promise<unknown>;

export type HumanApprovalHandler = (approvalId: string, actionContext: string) => Promise<boolean>;

export interface SupervisorOptions {
  dispatcher: ToolDispatcher;
  approvalHandler?: HumanApprovalHandler;
  onEvent?: (event: TaskExecutionEvent) => void;
}

export class ExecutionSupervisor {
  private readonly dispatcher: ToolDispatcher;
  private readonly approvalHandler?: HumanApprovalHandler;
  private readonly onEvent?: (event: TaskExecutionEvent) => void;
  private readonly journal: ExecutionJournalEntry[] = [];

  constructor(options: SupervisorOptions) {
    this.dispatcher = options.dispatcher;
    this.approvalHandler = options.approvalHandler;
    this.onEvent = options.onEvent;
  }

  /**
   * Executes an entire ExecutionPlan in topological DAG order.
   */
  public async executePlan(plan: ExecutionPlan): Promise<ExecutionPlan> {
    logger.info(`[ExecutionSupervisor] Starting plan ${plan.planId} ("${plan.goal}")`);
    plan.status = 'EXECUTING';

    const completedTaskMap = new Map<string, PlanTask>();
    const generatedSections: unknown[] = [];
    const maxAttempts = plan.maxVerificationAttempts || 3;

    for (let i = 0; i < plan.tasks.length; i++) {
      const task = plan.tasks[i];
      if (!task) continue;
      plan.currentTaskIndex = i;

      // 1. Verify dependencies have succeeded
      const unmetDeps = task.dependencies.filter((depId) => {
        const depTask = completedTaskMap.get(depId);
        return !depTask || depTask.status !== 'SUCCESS';
      });

      if (unmetDeps.length > 0) {
        task.status = 'FAILED';
        task.error = `Unmet task dependencies: ${unmetDeps.join(', ')}`;
        this.emitEvent(plan.planId, task);
        plan.status = 'FAILED';
        return plan;
      }

      // 2. Interpolate dynamic arguments
      const resolvedArgs = this.resolveArguments(task.arguments, completedTaskMap, generatedSections);

      // 3. Execute the task
      task.status = 'RUNNING';
      task.startedAt = new Date().toISOString();
      this.emitEvent(plan.planId, task);

      const t0 = Date.now();
      try {
        let rawResult: unknown;
        if (task.tool === 'craftor_verify_visual' || task.verificationType === 'VISUAL') {
          let targetUrl = String(resolvedArgs.url || '');
          if (!targetUrl || targetUrl === 'undefined' || targetUrl === plan.siteUrl) {
            if (resolvedArgs.pageId) {
              targetUrl = `${plan.siteUrl}/?p=${resolvedArgs.pageId}`;
            } else {
              targetUrl = plan.siteUrl;
            }
          }
          const minRootContainers = typeof resolvedArgs.minRootContainers === 'number' ? resolvedArgs.minRootContainers : 1;
          
          let lastError: Error | null = null;
          let verificationPassed = false;
          let verificationOutput: Record<string, unknown> = {};

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            logger.info(`[ExecutionSupervisor] Executing visual verification (Attempt ${attempt}/${maxAttempts}) for ${targetUrl}`);
            const verification = await VisualVerifier.verify({
              url: targetUrl,
              minRootContainers,
            });

            verificationOutput = {
              success: verification.overallStatus !== 'FAIL',
              overallStatus: verification.overallStatus,
              summary: verification.summary,
              viewports: verification.viewports.map((v) => ({
                viewport: v.viewport.name,
                width: v.width,
                height: v.height,
                status: v.status,
                rootContainers: v.domMetrics.rootContainers,
                hasOverflow: v.overflow.hasHorizontalOverflow,
                screenshotPath: v.screenshotPath,
              })),
              failures: verification.failures,
              warnings: verification.warnings,
            };

            if (verification.overallStatus !== 'FAIL') {
              verificationPassed = true;
              break;
            } else {
              lastError = new Error(`Visual verification failed on attempt ${attempt}: ${verification.failures.join('; ')}`);
            }
          }

          if (!verificationPassed && lastError) {
            throw lastError;
          }
          rawResult = verificationOutput;
        } else {
          rawResult = await this.dispatcher(task.tool, resolvedArgs);
        }

        const durationMs = Date.now() - t0;

        let parsedOutput: Record<string, unknown> = {};
        if (typeof rawResult === 'object' && rawResult !== null) {
          parsedOutput = rawResult as Record<string, unknown>;
        }

        // Check if tool returned content text JSON
        if (
          parsedOutput.content &&
          Array.isArray(parsedOutput.content) &&
          parsedOutput.content[0] &&
          typeof parsedOutput.content[0].text === 'string'
        ) {
          try {
            parsedOutput = JSON.parse(parsedOutput.content[0].text);
          } catch {
            // Keep raw parsedOutput
          }
        }

        // Handle PENDING Human Approval Interception
        if (parsedOutput.status === 'PENDING' && typeof parsedOutput.approvalId === 'string') {
          const approvalId = parsedOutput.approvalId;
          task.status = 'BLOCKED_ON_APPROVAL';
          this.emitEvent(plan.planId, task);

          if (this.approvalHandler) {
            const approved = await this.approvalHandler(approvalId, task.title);
            if (approved) {
              // Retry with approved approvalId
              resolvedArgs.approvalId = approvalId;
              const approvedResult = await this.dispatcher(task.tool, resolvedArgs);
              if (typeof approvedResult === 'object' && approvedResult !== null) {
                parsedOutput = approvedResult as Record<string, unknown>;
                if (parsedOutput.content && Array.isArray(parsedOutput.content) && parsedOutput.content[0]) {
                  try {
                    parsedOutput = JSON.parse(parsedOutput.content[0].text);
                  } catch {
                    // Ignore JSON parse error and keep raw output
                  }
                }
              }
            } else {
              task.status = 'FAILED';
              task.error = `Human administrator rejected approval ${approvalId}`;
              this.emitEvent(plan.planId, task);
              plan.status = 'FAILED';
              return plan;
            }
          }
        }

        // Store outputs
        task.status = 'SUCCESS';
        task.output = parsedOutput;
        task.completedAt = new Date().toISOString();
        task.durationMs = durationMs;

        // If this was a container generation step, accumulate to sections
        if (task.tool === 'craftor_elementor_generate_container' && parsedOutput.node) {
          generatedSections.push(parsedOutput.node);
        }

        completedTaskMap.set(task.id, task);
        plan.completedTasks++;
        this.emitEvent(plan.planId, task);

        this.journal.push({
          traceId: `tr_${Math.random().toString(36).substring(2, 9)}`,
          planId: plan.planId,
          taskId: task.id,
          tool: task.tool,
          riskLevel: task.riskLevel,
          durationMs,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const durationMs = Date.now() - t0;
        task.status = 'FAILED';
        task.error = (err as Error).message;
        task.completedAt = new Date().toISOString();
        task.durationMs = durationMs;
        this.emitEvent(plan.planId, task);

        this.journal.push({
          traceId: `tr_${Math.random().toString(36).substring(2, 9)}`,
          planId: plan.planId,
          taskId: task.id,
          tool: task.tool,
          riskLevel: task.riskLevel,
          durationMs,
          status: 'FAILED',
          error: task.error,
          timestamp: new Date().toISOString(),
        });

        plan.status = 'FAILED';
        return plan;
      }
    }

    plan.status = 'COMPLETED';
    logger.info(`[ExecutionSupervisor] Completed plan ${plan.planId} (${plan.completedTasks}/${plan.totalTasks} tasks)`);
    return plan;
  }

  public getJournal(): ExecutionJournalEntry[] {
    return [...this.journal];
  }

  private resolveArguments(
    rawArgs: Record<string, unknown>,
    completedMap: Map<string, PlanTask>,
    generatedSections: unknown[],
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(rawArgs)) {
      if (typeof val === 'string') {
        if (val === '$aggregate.sections') {
          resolved[key] = generatedSections;
        } else if (val.startsWith('$steps.')) {
          resolved[key] = this.resolvePath(val, completedMap);
        } else {
          resolved[key] = val;
        }
      } else if (Array.isArray(val)) {
        resolved[key] = val.map((item) =>
          typeof item === 'string' && item.startsWith('$steps.') ? this.resolvePath(item, completedMap) : item,
        );
      } else if (typeof val === 'object' && val !== null) {
        resolved[key] = this.resolveArguments(val as Record<string, unknown>, completedMap, generatedSections);
      } else {
        resolved[key] = val;
      }
    }

    return resolved;
  }

  private resolvePath(pathStr: string, completedMap: Map<string, PlanTask>): unknown {
    // E.g. "$steps.create_page.output.page.id" or "$steps.create_page.output.postId"
    const parts = pathStr.replace('$steps.', '').split('.');
    const stepId = parts[0] ?? '';
    const task = completedMap.get(stepId);
    if (!task || !task.output) return undefined;

    let current: unknown = task.output;
    const startIndex = parts[1] === 'output' ? 2 : 1;
    for (let i = startIndex; i < parts.length; i++) {
      const partKey = parts[i];
      if (partKey && current && typeof current === 'object') {
        const obj = current as Record<string, unknown>;
        if (partKey in obj) {
          current = obj[partKey];
        } else if (partKey === 'page' && 'post' in obj) {
          current = obj['post'];
        } else if (partKey === 'post' && 'page' in obj) {
          current = obj['page'];
        } else if (partKey === 'id' && 'postId' in obj) {
          current = obj['postId'];
        } else if (partKey === 'link' && 'url' in obj) {
          current = obj['url'];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
    return current;
  }

  private emitEvent(planId: string, task: PlanTask): void {
    if (this.onEvent) {
      this.onEvent({
        planId,
        taskId: task.id,
        taskTitle: task.title,
        tool: task.tool,
        status: task.status,
        durationMs: task.durationMs,
        output: task.output,
        error: task.error,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
