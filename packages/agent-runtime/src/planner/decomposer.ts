/**
 * Craftor Goal Decomposer & Autonomous DAG Planner
 * Transforms natural language requirements into an executable dependency graph of MCP tasks.
 */

import { ExecutionPlan, PlanTask, SiteCapabilityProfile } from '../types.js';

export interface DecomposeOptions {
  siteUrl?: string;
  archetype?: string;
  palette?: { primary?: string; secondary?: string; background?: string; text?: string };
}

export class GoalDecomposer {
  /**
   * Decomposes a high-level user goal into an ordered execution plan DAG.
   */
  public static decomposeGoal(
    goal: string,
    capabilities?: Partial<SiteCapabilityProfile>,
    options: DecomposeOptions = {},
  ): ExecutionPlan {
    const planId = `plan_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const lowerGoal = goal.toLowerCase();

    // 1. Detect industry / archetype
    let archetype = options.archetype || 'general';
    if (lowerGoal.includes('saas') || lowerGoal.includes('startup') || lowerGoal.includes('software') || lowerGoal.includes('dark')) {
      archetype = 'saas';
    } else if (lowerGoal.includes('gym') || lowerGoal.includes('fitness') || lowerGoal.includes('crossfit') || lowerGoal.includes('training')) {
      archetype = 'fitness';
    } else if (lowerGoal.includes('agency') || lowerGoal.includes('portfolio') || lowerGoal.includes('design studio')) {
      archetype = 'agency';
    } else if (lowerGoal.includes('restaurant') || lowerGoal.includes('food') || lowerGoal.includes('cafe')) {
      archetype = 'restaurant';
    } else if (lowerGoal.includes('store') || lowerGoal.includes('ecommerce') || lowerGoal.includes('shop')) {
      archetype = 'ecommerce';
    }

    const tasks: PlanTask[] = [];

    // Step 1: Probe / Inspect Target Site
    tasks.push({
      id: 'inspect_site',
      title: 'Inspect Target Site Capabilities & Tokens',
      tool: 'craftor_system_status',
      arguments: {},
      dependencies: [],
      riskLevel: 'READ_ONLY',
      expectedPostcondition: { type: 'REST_FIELD', field: 'status', expectedValue: 'healthy' },
      status: 'PENDING',
    });

    // Step 2: Create Target Page in WordPress
    const pageTitle = archetype === 'saas'
      ? 'NextGen SaaS Platform'
      : archetype === 'fitness'
        ? 'IronForge Gym & Fitness'
        : archetype === 'agency'
          ? 'Creative Design Studio'
          : 'Modern Business Homepage';

    tasks.push({
      id: 'create_page',
      title: `Create WordPress Page ("${pageTitle}")`,
      tool: 'craftor_wp_create_page',
      arguments: {
        title: pageTitle,
        status: 'publish',
        template: 'elementor_header_footer',
      },
      dependencies: ['inspect_site'],
      riskLevel: 'SAFE_MUTATION',
      expectedPostcondition: { type: 'REST_FIELD', field: 'success', expectedValue: true },
      status: 'PENDING',
    });

    // Step 3: Generate 8-Section Elementor Layout
    const sections = archetype === 'saas'
      ? [
          { layoutType: 'hero', title: 'Empower Your Business with AI', subtitle: 'Automate workflows, scale operations, and accelerate growth.', ctaText: 'Start Free Trial' },
          { layoutType: 'feature_grid', title: 'Intelligent Cloud Architecture', subtitle: 'Zero latency, global CDN, and real-time collaboration.' },
          { layoutType: 'feature_grid', title: 'Enterprise Security & Compliance', subtitle: 'SOC2 Type II, HIPAA, and end-to-end zero-trust encryption.' },
          { layoutType: 'pricing', title: 'Flexible Pricing for Growing Teams', subtitle: 'Transparent plans. No hidden fees. Cancel anytime.' },
          { layoutType: 'testimonials', title: 'Loved by over 10,000+ Founders', subtitle: 'Read how high-growth startups scale with our platform.' },
          { layoutType: 'faq', title: 'Frequently Asked Questions', subtitle: 'Everything you need to know about our platform.' },
          { layoutType: 'cta_banner', title: 'Ready to Scale Your Startup?', subtitle: 'Join thousands of innovators building the future.', ctaText: 'Get Started Today' },
        ]
      : [
          { layoutType: 'hero', title: 'Forge Your Ultimate Physique', subtitle: 'State-of-the-art equipment and elite trainers.', ctaText: 'Join Today' },
          { layoutType: 'feature_grid', title: 'Why Choose IronForge', subtitle: 'Premium amenities and Olympic training zones.' },
          { layoutType: 'feature_grid', title: 'High-Performance Classes', subtitle: 'HIIT, Powerlifting, CrossFit & Yoga.' },
          { layoutType: 'pricing', title: 'Flexible Membership Plans', subtitle: 'No lock-in contracts. Cancel anytime.' },
          { layoutType: 'testimonials', title: 'Member Transformations', subtitle: 'Real stories from real athletes.' },
          { layoutType: 'faq', title: 'Frequently Asked Questions', subtitle: 'Everything you need to know before joining.' },
          { layoutType: 'cta_banner', title: 'Start Your 7-Day Free Trial', subtitle: 'Unlock your potential now.', ctaText: 'Claim Free Pass' },
        ];

    sections.forEach((sec, idx) => {
      const stepId = `gen_section_${idx + 1}`;
      tasks.push({
        id: stepId,
        title: `Generate Section ${idx + 1} (${sec.layoutType}): "${sec.title}"`,
        tool: 'craftor_elementor_generate_container',
        arguments: sec,
        dependencies: ['inspect_site'],
        riskLevel: 'READ_ONLY',
        status: 'PENDING',
      });
    });

    const sectionStepIds = sections.map((_, idx) => `gen_section_${idx + 1}`);

    // Step 4: Pre-Mutation Snapshot
    tasks.push({
      id: 'capture_pre_snapshot',
      title: 'Capture Pre-Mutation Integrity Snapshot',
      tool: 'craftor_create_snapshot',
      arguments: {
        targetType: 'elementor_data',
        targetId: '$steps.create_page.output.page.id',
        payload: { intent: 'pre_elementor_save' },
        actionContext: `Automated plan baseline for ${archetype} homepage`,
      },
      dependencies: ['create_page', ...sectionStepIds],
      riskLevel: 'SAFE_MUTATION',
      status: 'PENDING',
    });

    // Step 5: Save Elementor Document
    tasks.push({
      id: 'save_elementor_doc',
      title: 'Persist 8-Section AST to Live Elementor Document',
      tool: 'craftor_elementor_save_document',
      arguments: {
        pageId: '$steps.create_page.output.page.id',
        elements: '$aggregate.sections',
      },
      dependencies: ['capture_pre_snapshot'],
      riskLevel: 'SAFE_MUTATION',
      expectedPostcondition: { type: 'AST_ELEMENT_COUNT', minCount: sections.length },
      status: 'PENDING',
    });

    // Step 6: Create WooCommerce Products (if e-commerce or pricing mentioned)
    if (lowerGoal.includes('pricing') || lowerGoal.includes('product') || lowerGoal.includes('woocommerce') || lowerGoal.includes('membership')) {
      const products = archetype === 'saas'
        ? [
            { name: 'Starter Tier Plan', regular_price: '19.00', sku: 'SAAS-STARTER', description: 'Essential cloud automation for early-stage teams.' },
            { name: 'Professional Tier Plan', regular_price: '49.00', sku: 'SAAS-PRO', description: 'Advanced AI workflows, analytics, and priority support.' },
            { name: 'Enterprise VIP Plan', regular_price: '99.00', sku: 'SAAS-ENTERPRISE', description: 'Dedicated account manager, custom SLA, and SSO.' },
          ]
        : [
            { name: 'Basic Gym Membership', regular_price: '29.99', sku: 'GYM-MEM-BASIC', description: 'Standard gym floor access and locker amenities.' },
            { name: 'Pro Fitness Membership', regular_price: '59.99', sku: 'GYM-MEM-PRO', description: 'Full access + all group classes and sauna.' },
            { name: 'Elite Performance VIP', regular_price: '99.99', sku: 'GYM-MEM-ELITE', description: 'All-inclusive 24/7 access + personal trainer.' },
          ];

      products.forEach((prod, pIdx) => {
        tasks.push({
          id: `create_wc_product_${pIdx + 1}`,
          title: `Create Product: "${prod.name}" ($${prod.regular_price})`,
          tool: 'craftor_wc_create_product',
          arguments: prod,
          dependencies: ['inspect_site'],
          riskLevel: 'SAFE_MUTATION',
          status: 'PENDING',
        });
      });
    }

    // Step 7: Update SEO Metadata
    tasks.push({
      id: 'update_seo',
      title: 'Configure SEO Titles, Descriptions & OpenGraph Meta',
      tool: 'craftor_seo_update_metadata',
      arguments: {
        postId: '$steps.create_page.output.page.id',
        metaTitle: `${pageTitle} | Official Website`,
        metaDescription: `Discover ${pageTitle}. Modern features, high performance, and flexible plans.`,
        focusKeywords: [archetype, 'modern', 'pricing', 'reviews'],
        pluginTarget: capabilities?.isRankMathActive ? 'rank_math' : 'yoast',
      },
      dependencies: ['save_elementor_doc'],
      riskLevel: 'SAFE_MUTATION',
      status: 'PENDING',
    });

    // Step 8: Post-Deployment Verification Readback
    tasks.push({
      id: 'verify_deployment',
      title: 'Execute Read-After-Write Consistency Verification',
      tool: 'craftor_elementor_get_document',
      arguments: {
        pageId: '$steps.create_page.output.page.id',
      },
      dependencies: ['save_elementor_doc', 'update_seo'],
      riskLevel: 'READ_ONLY',
      expectedPostcondition: { type: 'AST_ELEMENT_COUNT', minCount: sections.length },
      status: 'PENDING',
    });

    // Step 9: Multi-Viewport Visual Intelligence & Responsive Closed-Loop Verification
    tasks.push({
      id: 'verify_visual',
      title: 'Execute Multi-Viewport Visual Layout & Responsive Verification (1440px/768px/375px)',
      tool: 'craftor_verify_visual',
      arguments: {
        url: '$steps.create_page.output.page.link',
        pageId: '$steps.create_page.output.page.id',
        minRootContainers: sections.length,
      },
      dependencies: ['verify_deployment'],
      riskLevel: 'READ_ONLY',
      verificationType: 'VISUAL',
      expectedPostcondition: { type: 'VISUAL_AUDIT', minCount: sections.length },
      status: 'PENDING',
    });

    return {
      planId,
      goal,
      archetype,
      siteUrl: options.siteUrl || capabilities?.siteUrl || 'http://localhost:8080',
      createdAt: new Date().toISOString(),
      tasks,
      status: 'DRAFT',
      totalTasks: tasks.length,
      completedTasks: 0,
      currentTaskIndex: 0,
      maxVerificationAttempts: 3,
      context: {},
    };
  }
}
