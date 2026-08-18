/**
 * Craftor Visual Intelligence & Closed-Loop Verification Test Suite
 * Validates ScreenshotEngine, DomAnalyzer, VisualDiffEngine, BaselineManager, and VisualVerifier.
 */

const {
  ScreenshotEngine,
  DomAnalyzer,
  VisualDiffEngine,
  BaselineManager,
  VisualVerifier,
  VIEWPORT_PROFILES,
} = require('../packages/visual-intelligence/dist/index.js');
const { GoalDecomposer, ExecutionSupervisor } = require('../packages/agent-runtime/dist/index.js');
const { handleToolsCall } = require('../packages/mcp-server/dist/handlers/tools.js');
const { ApprovalEngine } = require('../packages/mcp-server/dist/safety/approval.js');
const { execSync } = require('child_process');

const SITE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8080';
const SECRET_TOKEN = process.env.WORDPRESS_API_TOKEN || 'crf_test_live_token_2026';

async function runVisualIntelligenceTests() {
  console.log('================================================================');
  console.log('    CRAFTOR VISUAL INTELLIGENCE & CLOSED-LOOP VERIFICATION      ');
  console.log('================================================================\n');

  // Test 1: Desktop, Tablet & Mobile Multi-Viewport Capture on Live Site
  console.log('[Test 1] Testing ScreenshotEngine across Desktop, Tablet & Mobile...');
  const testUrl = `${SITE_URL}/`;
  const screenshots = await ScreenshotEngine.captureViewports({
    url: testUrl,
    viewports: ['desktop', 'tablet', 'mobile'],
  });

  if (screenshots.length !== 3) {
    throw new Error(`Expected 3 viewport results, got ${screenshots.length}`);
  }
  screenshots.forEach((s) => {
    console.log(`  ✅ [${s.viewport.name.toUpperCase()}] ${s.width}x${s.height} captured in ${s.loadTimeMs}ms (HTTP ${s.statusCode}) -> ${s.screenshotPath}`);
    console.log(`     DOM: ${s.domMetrics.rootContainers} containers, ${s.domMetrics.headings} headings, ${s.domMetrics.buttons} buttons`);
    console.log(`     Overflow: ${s.overflow.hasHorizontalOverflow ? 'FAIL' : 'PASS (0px)'}`);
  });

  // Test 2: DomAnalyzer Elementor Detection & Semantic Metrics
  console.log('\n[Test 2] Testing DomAnalyzer Semantic Extraction...');
  const sampleElementorHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>NextGen SaaS Platform</title></head>
      <body>
        <div class="elementor elementor-18">
          <div class="elementor-element e-con e-con-full">
            <h1 class="elementor-heading-title">Empower Your Business with AI</h1>
            <a class="elementor-button elementor-button-link"><span class="elementor-button-text">Get Started</span></a>
          </div>
          <div class="elementor-element e-con e-con-boxed">
            <h2 class="elementor-heading-title">Intelligent Cloud Architecture</h2>
            <img src="https://example.com/feature1.png" alt="Feature 1" />
          </div>
          <div class="elementor-element e-con e-con-boxed">
            <h2 class="elementor-heading-title">Enterprise Security</h2>
            <img src="" alt="Broken Image" />
          </div>
        </div>
      </body>
    </html>
  `;
  const { domMetrics: parsedDom, overflow: parsedOverflow } = DomAnalyzer.analyzeHtml(sampleElementorHtml, VIEWPORT_PROFILES.desktop);
  if (!parsedDom.hasElementorRoot || parsedDom.rootContainers !== 3 || parsedDom.headings !== 3 || parsedDom.buttons !== 1 || parsedDom.missingImages !== 1) {
    throw new Error(`DomAnalyzer extraction mismatch: ${JSON.stringify(parsedDom)}`);
  }
  console.log(`  ✅ DomAnalyzer accurately detected Elementor root, 3 containers, 3 headings, 1 button, 1 missing image.`);

  // Test 3: Horizontal Overflow Detection
  console.log('\n[Test 3] Testing Horizontal Overflow Detection...');
  const overflowHtml = `
    <html>
      <body>
        <div style="width: 600px;">Wide non-responsive element</div>
      </body>
    </html>
  `;
  const { overflow: mobileOverflow } = DomAnalyzer.analyzeHtml(overflowHtml, VIEWPORT_PROFILES.mobile);
  if (!mobileOverflow.hasHorizontalOverflow || mobileOverflow.overflowPx !== 225) {
    throw new Error(`Expected horizontal overflow of 225px on 375px viewport, got ${mobileOverflow.overflowPx}px`);
  }
  console.log(`  ✅ Successfully detected horizontal overflow on mobile (Width: 600px on 375px screen, Overflow: +225px).`);

  // Test 4: VisualDiffEngine Comparison & Severity
  console.log('\n[Test 4] Testing VisualDiffEngine...');
  const baselineResult = screenshots[0];
  const modifiedResult = {
    ...baselineResult,
    domMetrics: {
      ...baselineResult.domMetrics,
      rootContainers: baselineResult.domMetrics.rootContainers + 4,
      totalWidgets: baselineResult.domMetrics.totalWidgets + 10,
    },
  };
  const diff = VisualDiffEngine.compare(baselineResult, modifiedResult);
  console.log(`  ✅ Diff Status: ${diff.status} | Severity: ${diff.severity} | Diff%: ${diff.differencePercentage}%`);
  console.log(`     Description: "${diff.description}"`);
  if (diff.status !== 'INTENDED_MUTATION') {
    throw new Error(`Expected INTENDED_MUTATION for added containers, got ${diff.status}`);
  }

  // Test 5: BaselineManager Storage & Retrieval
  console.log('\n[Test 5] Testing BaselineManager Persistence...');
  const baselineMgr = new BaselineManager();
  const baselineRec = baselineMgr.createBaseline('test_site', 18, baselineResult, true);
  const retrievedRec = baselineMgr.getBaseline('test_site', 18, 'desktop');
  if (!retrievedRec || retrievedRec.hash !== baselineRec.hash) {
    throw new Error('BaselineManager persistence/retrieval mismatch');
  }
  console.log(`  ✅ Baseline saved and retrieved: "${retrievedRec.hash}" for site "test_site" page 18.`);

  // Test 6: VisualVerifier Contract
  console.log('\n[Test 6] Testing VisualVerifier Contract...');
  const verificationResult = await VisualVerifier.verify({
    url: testUrl,
    minRootContainers: 0,
  });
  console.log(`  ✅ Overall Status: ${verificationResult.overallStatus}`);
  console.log(`  ✅ Viewports Verified: ${verificationResult.viewports.length}`);
  console.log(`  ✅ Failures: ${verificationResult.failures.length} | Warnings: ${verificationResult.warnings.length}`);
  if (verificationResult.overallStatus === 'FAIL') {
    throw new Error(`VisualVerifier failed unexpectedly on live site: ${verificationResult.failures.join(', ')}`);
  }

  // Test 7: Closed-Loop DAG Execution with verify_visual Task via ExecutionSupervisor
  console.log('\n[Test 7] Running Full Autonomous L4 Closed-Loop Execution Plan...');
  const plan = GoalDecomposer.decomposeGoal('Create an AI SaaS startup landing page with pricing and subscriptions', {
    siteUrl: SITE_URL,
    isElementorActive: true,
    isWooCommerceActive: true,
  });

  const supervisor = new ExecutionSupervisor({
    dispatcher: async (toolName, args) => {
      return handleToolsCall({ name: toolName, arguments: args }, SITE_URL, SECRET_TOKEN);
    },
    approvalHandler: async (approvalId) => {
      ApprovalEngine.approve(approvalId, 'admin');
      return true;
    },
    onEvent: (event) => {
      if (event.status === 'RUNNING') {
        console.log(`  ▶ [TASK] ${event.taskTitle}`);
      } else if (event.status === 'SUCCESS') {
        console.log(`  ✅ [DONE] ${event.taskTitle} (${event.durationMs}ms)`);
      }
    },
  });

  const executedPlan = await supervisor.executePlan(plan);
  console.log(`\n  ✅ Autonomous Plan Status: ${executedPlan.status} (${executedPlan.completedTasks}/${executedPlan.totalTasks} tasks)`);
  if (executedPlan.status !== 'COMPLETED') {
    throw new Error(`Autonomous plan did not complete successfully. Status: ${executedPlan.status}`);
  }

  console.log('\n================================================================');
  console.log('     ALL VISUAL INTELLIGENCE & CLOSED-LOOP TESTS PASSED!        ');
  console.log('================================================================\n');
}

runVisualIntelligenceTests().catch((err) => {
  console.error('\n❌ Fatal error in Visual Intelligence test suite:', err);
  process.exit(1);
});
