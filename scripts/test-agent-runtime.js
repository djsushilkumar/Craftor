/**
 * Craftor Autonomous Agent Runtime Verification Script
 * Tests GoalDecomposer DAG generation and ExecutionSupervisor autonomous pipeline.
 */

const { GoalDecomposer, ExecutionSupervisor } = require('../packages/agent-runtime/dist/index.js');
const { handleToolsCall } = require('../packages/mcp-server/dist/handlers/tools.js');
const { ApprovalEngine } = require('../packages/mcp-server/dist/safety/approval.js');
const { execSync } = require('child_process');

const SITE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8080';
const SECRET_TOKEN = process.env.WORDPRESS_API_TOKEN || 'crf_test_live_token_2026';

async function runAutonomousRuntimeTest() {
  console.log('================================================================');
  console.log('       CRAFTOR AUTONOMOUS AGENT RUNTIME ACCEPTANCE TEST         ');
  console.log('================================================================\n');

  const goal = 'Create a modern SaaS startup website with dark theme, pricing plans, and WooCommerce subscription products';
  console.log(`[Goal] "${goal}"\n`);

  // 1. Test Goal Decomposer DAG
  console.log('[Step 1] Running GoalDecomposer...');
  const plan = GoalDecomposer.decomposeGoal(goal, {
    siteUrl: SITE_URL,
    isElementorActive: true,
    isWooCommerceActive: true,
    isRankMathActive: true,
  });

  console.log(`  ✅ Decomposed into Plan ID: "${plan.planId}" (Archetype: "${plan.archetype}")`);
  console.log(`  ✅ Total Tasks in DAG: ${plan.totalTasks}`);
  plan.tasks.forEach((t, i) => {
    console.log(`     ${i + 1}. [${t.riskLevel}] ${t.title} (Tool: ${t.tool}, Deps: [${t.dependencies.join(', ')}])`);
  });

  // 2. Initialize Execution Supervisor
  console.log('\n[Step 2] Executing Plan via ExecutionSupervisor...');
  const supervisor = new ExecutionSupervisor({
    dispatcher: async (toolName, args) => {
      return handleToolsCall({ name: toolName, arguments: args }, SITE_URL, SECRET_TOKEN);
    },
    approvalHandler: async (approvalId, actionContext) => {
      console.log(`     [HUMAN APPROVAL GATEWAY] Intercepted approval: "${approvalId}" for "${actionContext}"`);
      ApprovalEngine.approve(approvalId, 'admin_user_session_1');
      if (SITE_URL) {
        try {
          const binPath = 'C:\\Users\\420\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin';
          process.env.PATH = `${binPath};${process.env.PATH}`;
          execSync(`docker exec craftor_wp_cli wp eval "\\Craftor\\Core\\Auth\\CraftorApproval::approve('${approvalId}', 'admin');" --path=/var/www/html --allow-root`, { stdio: 'pipe' });
        } catch {}
      }
      return true;
    },
    onEvent: (event) => {
      if (event.status === 'RUNNING') {
        console.log(`  ▶ [TASK START] ${event.taskTitle}`);
      } else if (event.status === 'SUCCESS') {
        console.log(`  ✅ [TASK DONE] ${event.taskTitle} (${event.durationMs}ms)`);
      } else if (event.status === 'FAILED') {
        console.log(`  ❌ [TASK FAIL] ${event.taskTitle}: ${event.error}`);
      }
    },
  });

  const t0 = Date.now();
  const resultPlan = await supervisor.executePlan(plan);
  const totalDurationMs = Date.now() - t0;

  console.log('\n================================================================');
  console.log('              AUTONOMOUS EXECUTION SUMMARY                      ');
  console.log('================================================================');
  console.log(`Plan Status        : ${resultPlan.status}`);
  console.log(`Tasks Completed    : ${resultPlan.completedTasks} / ${resultPlan.totalTasks}`);
  console.log(`Total Execution Time: ${totalDurationMs} ms`);
  console.log(`Execution Journal  : ${supervisor.getJournal().length} entries recorded`);
  console.log('================================================================\n');

  if (resultPlan.status === 'COMPLETED') {
    console.log('🚀 AUTONOMOUS AGENT RUNTIME PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } else {
    console.error('❌ Autonomous Agent Runtime failed');
    process.exit(1);
  }
}

runAutonomousRuntimeTest().catch((err) => {
  console.error('Fatal error running agent runtime test:', err);
  process.exit(1);
});
