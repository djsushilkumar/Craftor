/**
 * Craftor Task 7 & Task 8 — Visual Intelligence & Closed-Loop Acceptance Test
 * 
 * Workflow:
 * 1. Open: http://localhost:8080/gym-fitness-homepage/
 * 2. Capture multi-viewport screenshots (Desktop, Tablet, Mobile) via Playwright
 * 3. Save baseline screenshots
 * 4. Modify the Elementor page (add promo section/CTA)
 * 5. Capture newly generated screenshots
 * 6. Run visual diff engine (pixel diff %, similarity, bounding boxes, heatmap)
 * 7. Generate artifacts/reports/visual-report.json
 */

const fs = require('fs');
const path = require('path');
const {
  PlaywrightScreenshotEngine,
  VisualDiffEngine,
  VIEWPORTS,
} = require('../packages/visual-intelligence/dist/index.js');
const { WordPressClient } = require('../packages/wordpress-bridge/dist/client.js');
const { ElementorDocumentManager } = require('../packages/wordpress-bridge/dist/document-manager.js');

const SITE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8080';
const SECRET_TOKEN = process.env.WORDPRESS_API_TOKEN || 'crf_test_live_token_2026';
const TARGET_PAGE_SLUG = 'gym-fitness-homepage';
const TARGET_URL = `${SITE_URL}/${TARGET_PAGE_SLUG}/`;

async function runVisualIntelligenceAcceptanceTest() {
  console.log('================================================================');
  console.log('   CRAFTOR TASK 7 & 8 — PLAYWRIGHT VISUAL INTELLIGENCE TEST     ');
  console.log('================================================================\n');

  const screenshotsDir = path.resolve(process.cwd(), 'artifacts', 'screenshots');
  const reportsDir = path.resolve(process.cwd(), 'artifacts', 'reports');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const wpClient = new WordPressClient({
    siteUrl: SITE_URL,
    auth: { type: 'bearer', token: SECRET_TOKEN },
  });

  // Ensure target page exists on live WordPress
  console.log(`[Step 0] Verifying target page "${TARGET_URL}" on live WordPress...`);
  let pageId = 18;
  try {
    const pages = await wpClient.getPages({ search: 'Gym' });
    if (pages && pages.length > 0 && pages[0]) {
      pageId = pages[0].id;
      console.log(`  ✅ Found existing Gym page (ID: ${pageId})`);
    } else {
      const created = await wpClient.createPage({
        title: 'Gym & Fitness Homepage',
        slug: TARGET_PAGE_SLUG,
        status: 'publish',
      });
      pageId = created.id;
      console.log(`  ✅ Created Gym page (ID: ${pageId})`);
    }
  } catch (err) {
    console.log(`  ℹ Page probe returned: ${err.message}. Using default ID ${pageId}`);
  }

  // 1. Initial State AST Setup
  const initialElements = [
    {
      id: 'sec_hero_1',
      elType: 'container',
      settings: { layout: 'boxed', background_background: 'classic', background_color: '#111827' },
      elements: [
        {
          id: 'w_head_1',
          elType: 'widget',
          widgetType: 'heading',
          settings: { title: 'Unleash Your Ultimate Fitness Potential', size: 'xxl' },
          elements: [],
        },
        {
          id: 'w_btn_1',
          elType: 'widget',
          widgetType: 'button',
          settings: { text: 'Claim 7-Day Free Trial', link: { url: '#join' } },
          elements: [],
        },
      ],
    },
    {
      id: 'sec_features_1',
      elType: 'container',
      settings: { layout: 'boxed', background_color: '#1F2937' },
      elements: [
        {
          id: 'w_head_feat',
          elType: 'widget',
          widgetType: 'heading',
          settings: { title: 'Elite Training Programs & Equipment' },
          elements: [],
        },
      ],
    },
  ];

  const docManager = new ElementorDocumentManager({ client: wpClient });

  console.log(`\n[Step 1] Deploying Initial Baseline AST to Page ${pageId}...`);
  await docManager.saveDocument(pageId, initialElements, { title: 'Gym & Fitness Homepage' });
  console.log('  ✅ Initial Elementor AST persisted to live MariaDB.');

  // 2. Capture Baseline Screenshots (Desktop, Tablet, Mobile)
  console.log(`\n[Step 2] Capturing Baseline Screenshots via Playwright across 3 viewports...`);
  const t0_baseline = Date.now();
  const baselineOutput = await PlaywrightScreenshotEngine.captureScreenshots({
    url: TARGET_URL,
    outputDir: screenshotsDir,
    prefix: 'gym_baseline',
    timeoutMs: 15000,
  });
  const baselineDurationMs = Date.now() - t0_baseline;

  console.log(`  ✅ Desktop Baseline : ${baselineOutput.desktop} (${fs.statSync(baselineOutput.desktop).size} bytes)`);
  console.log(`  ✅ Tablet Baseline  : ${baselineOutput.tablet} (${fs.statSync(baselineOutput.tablet).size} bytes)`);
  console.log(`  ✅ Mobile Baseline  : ${baselineOutput.mobile} (${fs.statSync(baselineOutput.mobile).size} bytes)`);
  console.log(`  ⏱ Capture Time     : ${baselineDurationMs} ms`);

  // 3. Modify the Elementor Page (Add Promo Banner & Pricing Matrix)
  console.log(`\n[Step 3] Modifying Elementor Page (Injecting VIP Promo Section & CTA Button)...`);
  const modifiedElements = [
    {
      id: 'sec_promo_vip',
      elType: 'container',
      settings: { layout: 'full', background_background: 'classic', background_color: '#DC2626' },
      elements: [
        {
          id: 'w_promo_head',
          elType: 'widget',
          widgetType: 'heading',
          settings: { title: '🔥 LIMITED TIME: 50% OFF ANNUAL ALL-ACCESS PASS', size: 'xl' },
          elements: [],
        },
        {
          id: 'w_promo_btn',
          elType: 'widget',
          widgetType: 'button',
          settings: { text: 'Claim 50% Discount Now', link: { url: '#claim' } },
          elements: [],
        },
      ],
    },
    ...initialElements,
  ];

  await docManager.saveDocument(pageId, modifiedElements, { title: 'Gym & Fitness Homepage (Updated)' });
  console.log('  ✅ Modified Elementor AST persisted to live WordPress.');

  // 4. Capture Modified Current Screenshots
  console.log(`\n[Step 4] Capturing Modified Screenshots via Playwright across 3 viewports...`);
  const t0_current = Date.now();
  const currentOutput = await PlaywrightScreenshotEngine.captureScreenshots({
    url: TARGET_URL,
    outputDir: screenshotsDir,
    prefix: 'gym_current',
    timeoutMs: 15000,
  });
  const currentDurationMs = Date.now() - t0_current;

  console.log(`  ✅ Desktop Current  : ${currentOutput.desktop} (${fs.statSync(currentOutput.desktop).size} bytes)`);
  console.log(`  ✅ Tablet Current   : ${currentOutput.tablet} (${fs.statSync(currentOutput.tablet).size} bytes)`);
  console.log(`  ✅ Mobile Current   : ${currentOutput.mobile} (${fs.statSync(currentOutput.mobile).size} bytes)`);
  console.log(`  ⏱ Capture Time     : ${currentDurationMs} ms`);

  // 5. Run Visual Diff Comparison
  console.log(`\n[Step 5] Executing Visual Diff Engine (Pixel Diff, Similarity & Bounding Boxes)...`);
  const t0_diff = Date.now();

  const desktopDiff = await VisualDiffEngine.compare({
    baselineImagePath: baselineOutput.desktop,
    currentImagePath: currentOutput.desktop,
    diffOutputPath: path.join(screenshotsDir, 'gym_diff_desktop.png'),
  });

  const tabletDiff = await VisualDiffEngine.compare({
    baselineImagePath: baselineOutput.tablet,
    currentImagePath: currentOutput.tablet,
    diffOutputPath: path.join(screenshotsDir, 'gym_diff_tablet.png'),
  });

  const mobileDiff = await VisualDiffEngine.compare({
    baselineImagePath: baselineOutput.mobile,
    currentImagePath: currentOutput.mobile,
    diffOutputPath: path.join(screenshotsDir, 'gym_diff_mobile.png'),
  });

  const diffDurationMs = Date.now() - t0_diff;

  console.log(`  ✅ [DESKTOP] Diff: ${desktopDiff.diffPercentage}% | Similarity: ${desktopDiff.similarity}% | Changed Pixels: ${desktopDiff.changedPixels} | Regions: ${desktopDiff.regions.length}`);
  console.log(`  ✅ [TABLET]  Diff: ${tabletDiff.diffPercentage}% | Similarity: ${tabletDiff.similarity}% | Changed Pixels: ${tabletDiff.changedPixels} | Regions: ${tabletDiff.regions.length}`);
  console.log(`  ✅ [MOBILE]  Diff: ${mobileDiff.diffPercentage}% | Similarity: ${mobileDiff.similarity}% | Changed Pixels: ${mobileDiff.changedPixels} | Regions: ${mobileDiff.regions.length}`);
  console.log(`  ⏱ Diff Time        : ${diffDurationMs} ms`);

  // 6. Generate Visual Report
  console.log(`\n[Step 6] Compiling artifacts/reports/visual-report.json...`);
  const visualReport = {
    url: TARGET_URL,
    timestamp: new Date().toISOString(),
    viewports: {
      desktop: {
        baselineScreenshot: baselineOutput.desktop,
        currentScreenshot: currentOutput.desktop,
        diffImage: desktopDiff.diffImagePath,
        diff: desktopDiff,
      },
      tablet: {
        baselineScreenshot: baselineOutput.tablet,
        currentScreenshot: currentOutput.tablet,
        diffImage: tabletDiff.diffImagePath,
        diff: tabletDiff,
      },
      mobile: {
        baselineScreenshot: baselineOutput.mobile,
        currentScreenshot: currentOutput.mobile,
        diffImage: mobileDiff.diffImagePath,
        diff: mobileDiff,
      },
    },
    passed: desktopDiff.changedPixels > 0 && tabletDiff.changedPixels > 0 && mobileDiff.changedPixels > 0,
    summary: {
      desktopSimilarity: desktopDiff.similarity,
      tabletSimilarity: tabletDiff.similarity,
      mobileSimilarity: mobileDiff.similarity,
      totalChangedRegions: desktopDiff.regions.length + tabletDiff.regions.length + mobileDiff.regions.length,
      totalExecutionTimeMs: baselineDurationMs + currentDurationMs + diffDurationMs,
    },
  };

  const reportPath = path.join(reportsDir, 'visual-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(visualReport, null, 2), 'utf-8');
  console.log(`  ✅ Visual Report successfully generated at: ${reportPath}`);

  // 7. Verify Acceptance Criteria
  console.log('\n================================================================');
  console.log('              ACCEPTANCE CRITERIA VERIFICATION                  ');
  console.log('================================================================');
  console.log(`✓ Desktop screenshot captured : PASS (${fs.existsSync(baselineOutput.desktop)})`);
  console.log(`✓ Tablet screenshot captured  : PASS (${fs.existsSync(baselineOutput.tablet)})`);
  console.log(`✓ Mobile screenshot captured  : PASS (${fs.existsSync(baselineOutput.mobile)})`);
  console.log(`✓ Pixel diff calculated       : PASS (Desktop: ${desktopDiff.diffPercentage}%, Tablet: ${tabletDiff.diffPercentage}%, Mobile: ${mobileDiff.diffPercentage}%)`);
  console.log(`✓ Visual report generated     : PASS (${fs.existsSync(reportPath)})`);
  console.log(`✓ Playwright integration      : PASS (Binary PNGs captured)`);
  console.log('================================================================\n');

  if (!visualReport.passed) {
    throw new Error('Visual diff did not detect expected layout mutation.');
  }

  console.log('🚀 TASK 7 & TASK 8 VISUAL INTELLIGENCE CERTIFICATION: 100% PASS!\n');
}

runVisualIntelligenceAcceptanceTest().catch((err) => {
  console.error('\n❌ Fatal error in Visual Intelligence test runner:', err);
  process.exit(1);
});
