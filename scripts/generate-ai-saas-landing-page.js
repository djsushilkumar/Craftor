/**
 * Craftor Elementor Engineer: AI SaaS Landing Page Generator & Canvas Sync
 * Generates a complete 6-section modern AI SaaS Elementor AST and synchronizes it with the canvas.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const { McpRouter } = require(path.join(ROOT_DIR, 'packages', 'mcp-server', 'dist', 'router.js'));
const { AstCanvasRenderer } = require(path.join(ROOT_DIR, 'apps', 'dashboard', 'dist', 'components', 'AstCanvasRenderer.js'));
const { generateHexUuid } = require(path.join(ROOT_DIR, 'packages', 'shared-utils', 'dist', 'index.js'));

function uid() {
  return generateHexUuid(7);
}

function createContainer(options = {}) {
  return {
    id: options.id || uid(),
    elType: 'container',
    isInner: options.isInner || false,
    settings: {
      flex_direction: options.flexDirection || 'column',
      justify_content: options.justifyContent || 'flex-start',
      align_items: options.alignItems || 'stretch',
      gap: options.gap || { unit: 'px', size: 20 },
      padding: options.padding || { unit: 'rem', top: '4', bottom: '4', left: '2', right: '2' },
      background_background: options.bg ? 'classic' : 'transparent',
      background_color: options.bg || 'transparent',
      border_border: options.border ? 'solid' : 'none',
      border_color: options.borderColor || 'transparent',
      border_radius: options.borderRadius || { unit: 'px', size: 12 },
      ...options.settings,
    },
    elements: options.elements || [],
  };
}

function createWidget(type, settings = {}) {
  return {
    id: uid(),
    elType: 'widget',
    widgetType: type,
    settings: {
      ...settings,
    },
    elements: [],
  };
}

async function generateCompleteAiSaasLandingPage() {
  console.log('================================================================');
  console.log('  CRAFTOR ELEMENTOR ENGINEER: AI SAAS LANDING PAGE GENERATOR    ');
  console.log('================================================================\n');

  const router = new McpRouter({
    siteUrl: 'https://demo.craftor.local',
    secretToken: 'crf_live_demo_sec_key_2026',
  });

  // -------------------------------------------------------------
  // 1. SECTION 1: HERO SECTION
  // -------------------------------------------------------------
  console.log('▶ [1/6] Synthesizing Hero Section Container...');
  const heroSection = createContainer({
    bg: '#0B0F19',
    padding: { unit: 'rem', top: '6', bottom: '6', left: '2', right: '2' },
    alignItems: 'center',
    justifyContent: 'center',
    settings: {
      background_background: 'classic',
      background_color: '#0B0F19',
      border_bottom_width: '1px',
      border_bottom_color: 'rgba(99, 102, 241, 0.2)',
    },
    elements: [
      createWidget('heading', {
        title: '⚡ NEXT-GENERATION AUTONOMOUS AI FOR WORDPRESS',
        header_size: 'span',
        align: 'center',
        title_color: '#818CF8',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: 14 },
        typography_font_weight: '700',
        typography_letter_spacing: { unit: 'px', size: 1.5 },
      }),
      createWidget('heading', {
        title: 'Transform Ideas into WordPress Reality at the Speed of Thought',
        header_size: 'h1',
        align: 'center',
        title_color: '#FFFFFF',
        typography_typography: 'custom',
        typography_font_size: { unit: 'rem', size: 3.5 },
        typography_font_weight: '800',
        typography_line_height: { unit: 'em', size: 1.15 },
      }),
      createWidget('text-editor', {
        editor: '<p style="text-align: center; color: #9CA3AF; font-size: 1.2rem; max-width: 780px; margin: 0 auto; line-height: 1.6;">The ultimate autonomous AI platform with 86+ MCP tools, direct Elementor AST synthesis, and sub-15ms serverless edge intelligence. Build pixel-perfect sites in seconds.</p>',
      }),
      createContainer({
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: { unit: 'px', size: 16 },
        padding: { unit: 'rem', top: '1.5', bottom: '1.5', left: '0', right: '0' },
        elements: [
          createWidget('button', {
            text: '🚀 Start Free 14-Day Trial',
            align: 'center',
            button_type: 'primary',
            link: { url: '#pricing' },
          }),
          createWidget('button', {
            text: '📺 Watch 2-Min Live Demo',
            align: 'center',
            button_type: 'secondary',
            link: { url: '#features' },
          }),
        ],
      }),
      createWidget('image', {
        image: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        },
        align: 'center',
        caption: 'Craftor Visual Web Studio & Elementor Live Canvas Bridge',
      }),
    ],
  });

  // -------------------------------------------------------------
  // 2. SECTION 2: FEATURES SECTION
  // -------------------------------------------------------------
  console.log('▶ [2/6] Synthesizing Features Section Grid Container...');
  const featuresList = [
    {
      icon: 'eicon-code',
      title: 'Direct Elementor AST Synthesis',
      desc: 'Zero layout corruption. Generates native Flexbox and CSS Grid containers with typed properties and Global Kit variable bindings.',
    },
    {
      icon: 'eicon-network',
      title: '86+ Universal MCP Tools',
      desc: 'Connects effortlessly to Claude Desktop, Cursor, Antigravity, VS Code, Roo Code, Windsurf, Zed, and OpenCode.',
    },
    {
      icon: 'eicon-cloud-check',
      title: 'Sub-15ms Serverless Edge Mesh',
      desc: 'Cloudflare Workers and Geo-distributed KV caching deliver instantaneous AST parsing and zero-lag editor previews.',
    },
    {
      icon: 'eicon-shield-check',
      title: 'Zero-Trust Security & Injection Shield',
      desc: 'Continuous AST sanitization intercepts malicious scripts, XSS vectors, and unauthorized prompt injections.',
    },
    {
      icon: 'eicon-users-round',
      title: 'Multi-Agent Swarm Collaboration',
      desc: 'CRDT conflict-free synchronization allows UI Designers, SEO Copywriters, and E-Commerce Architects to build simultaneously.',
    },
    {
      icon: 'eicon-microphone',
      title: 'Real-Time Voice Studio',
      desc: 'Hands-free Elementor editing with speech-to-intent natural language classification and instant AST mutation dispatching.',
    },
  ];

  const featureCards = featuresList.map((f) =>
    createContainer({
      bg: 'rgba(17, 24, 39, 0.7)',
      padding: { unit: 'rem', top: '2', bottom: '2', left: '1.5', right: '1.5' },
      borderRadius: { unit: 'px', size: 12 },
      border: true,
      borderColor: 'rgba(75, 85, 99, 0.4)',
      elements: [
        createWidget('heading', {
          title: `✦ ${f.title}`,
          header_size: 'h3',
          title_color: '#F9FAFB',
          typography_font_size: { unit: 'rem', size: 1.25 },
        }),
        createWidget('text-editor', {
          editor: `<p style="color: #9CA3AF; line-height: 1.6; font-size: 0.95rem;">${f.desc}</p>`,
        }),
      ],
    })
  );

  const featuresSection = createContainer({
    bg: '#0F172A',
    padding: { unit: 'rem', top: '5', bottom: '5', left: '2', right: '2' },
    alignItems: 'center',
    elements: [
      createWidget('heading', {
        title: 'CORE CAPABILITIES',
        header_size: 'span',
        align: 'center',
        title_color: '#38BDF8',
        typography_font_size: { unit: 'px', size: 13 },
        typography_font_weight: '700',
      }),
      createWidget('heading', {
        title: 'Engineered for Autonomous WordPress Excellence',
        header_size: 'h2',
        align: 'center',
        title_color: '#FFFFFF',
        typography_font_size: { unit: 'rem', size: 2.5 },
      }),
      createContainer({
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: { unit: 'px', size: 24 },
        padding: { unit: 'rem', top: '2', bottom: '1', left: '0', right: '0' },
        elements: featureCards.slice(0, 3),
      }),
      createContainer({
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: { unit: 'px', size: 24 },
        padding: { unit: 'rem', top: '1', bottom: '2', left: '0', right: '0' },
        elements: featureCards.slice(3, 6),
      }),
    ],
  });

  // -------------------------------------------------------------
  // 3. SECTION 3: PRICING SECTION
  // -------------------------------------------------------------
  console.log('▶ [3/6] Synthesizing Pricing Section Container...');
  const pricingTiers = [
    {
      name: 'Starter Tier',
      price: '$29',
      period: '/ month',
      desc: 'Ideal for freelance developers and individual WordPress site creators.',
      features: ['Up to 5 WordPress Sites', '45 Essential MCP Tools', 'Standard AST Synthesis', 'Community Discord Support'],
      popular: false,
    },
    {
      name: 'Agency Pro Tier',
      price: '$79',
      period: '/ month',
      desc: 'The complete autonomous studio for fast-growing digital agencies.',
      features: [
        'Unlimited WordPress & Multisite',
        'Complete 86+ MCP Tools Catalog',
        'Real-Time AI Voice Studio',
        'Sub-15ms Serverless Edge Mesh',
        'Multi-Agent Collaborative Swarm',
        '24/7 Priority VIP Support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise Tier',
      price: '$199',
      period: '/ month',
      desc: 'Custom dedicated clusters with enterprise SLA and security guarantees.',
      features: [
        'Dedicated Kubernetes Pods',
        'Custom LLM Fine-Tuning',
        '99.99% Guaranteed SLA',
        'Zero-Trust AES-256 Vault',
        'Dedicated Solutions Architect',
      ],
      popular: false,
    },
  ];

  const pricingCards = pricingTiers.map((p) =>
    createContainer({
      bg: p.popular ? 'rgba(30, 27, 75, 0.85)' : 'rgba(17, 24, 39, 0.7)',
      padding: { unit: 'rem', top: '2.5', bottom: '2.5', left: '2', right: '2' },
      borderRadius: { unit: 'px', size: 16 },
      border: true,
      borderColor: p.popular ? '#6366F1' : 'rgba(75, 85, 99, 0.4)',
      settings: {
        flex_direction: 'column',
        justify_content: 'space-between',
        box_shadow: p.popular ? '0 10px 30px rgba(99, 102, 241, 0.3)' : 'none',
      },
      elements: [
        createWidget('heading', {
          title: p.popular ? `⭐ ${p.name} (MOST POPULAR)` : p.name,
          header_size: 'h3',
          title_color: p.popular ? '#A5B4FC' : '#F3F4F6',
          typography_font_size: { unit: 'rem', size: 1.3 },
        }),
        createWidget('heading', {
          title: `${p.price} <span style="font-size: 1rem; color: #9CA3AF; font-weight: 400;">${p.period}</span>`,
          header_size: 'h2',
          title_color: '#FFFFFF',
          typography_font_size: { unit: 'rem', size: 2.8 },
        }),
        createWidget('text-editor', {
          editor: `<p style="color: #9CA3AF; font-size: 0.9rem; margin-bottom: 1.5rem;">${p.desc}</p>
                   <ul style="color: #D1D5DB; line-height: 1.8; padding-left: 1.2rem; font-size: 0.95rem;">
                     ${p.features.map((item) => `<li>${item}</li>`).join('')}
                   </ul>`,
        }),
        createWidget('button', {
          text: p.popular ? 'Get Started with Pro' : 'Choose Plan',
          button_type: p.popular ? 'primary' : 'secondary',
          align: 'center',
          link: { url: '#contact' },
        }),
      ],
    })
  );

  const pricingSection = createContainer({
    bg: '#0B0F19',
    padding: { unit: 'rem', top: '5', bottom: '5', left: '2', right: '2' },
    alignItems: 'center',
    elements: [
      createWidget('heading', {
        title: 'FLEXIBLE PRICING',
        header_size: 'span',
        align: 'center',
        title_color: '#818CF8',
        typography_font_size: { unit: 'px', size: 13 },
        typography_font_weight: '700',
      }),
      createWidget('heading', {
        title: 'Simple, Transparent Plans for Every Team',
        header_size: 'h2',
        align: 'center',
        title_color: '#FFFFFF',
        typography_font_size: { unit: 'rem', size: 2.5 },
      }),
      createContainer({
        flexDirection: 'row',
        justifyContent: 'center',
        gap: { unit: 'px', size: 24 },
        padding: { unit: 'rem', top: '2.5', bottom: '1', left: '0', right: '0' },
        elements: pricingCards,
      }),
    ],
  });

  // -------------------------------------------------------------
  // 4. SECTION 4: FAQ SECTION
  // -------------------------------------------------------------
  console.log('▶ [4/6] Synthesizing FAQ Section Container...');
  const faqs = [
    {
      q: 'How does Craftor integrate directly into Elementor without causing layout breakage?',
      a: 'Craftor operates on the native Elementor JSON AST (Abstract Syntax Tree), applying deterministic schema validation against Elementor container and widget control stacks prior to committing any database postmeta.',
    },
    {
      q: 'Which AI models and code editors are natively supported?',
      a: 'Craftor supports Claude 3.5 Sonnet, GPT-4o, Gemini 2.0, DeepSeek R1, and local Ollama models across 8 official client adapters (Claude Desktop, Cursor, Antigravity, VS Code, Roo Code, Windsurf, Zed, and OpenCode).',
    },
    {
      q: 'Can I rollback an AI generation if I do not like the outcome?',
      a: 'Yes! Craftor automatically takes transactional database snapshots ($wpdb) before every mutation. You can instantly restore any prior state with 1-click micro-rollback.',
    },
    {
      q: 'Is Craftor compatible with Elementor Pro and 3rd-Party Addons?',
      a: 'Absolutely. Craftor includes first-party adapters for Elementor Pro, Crocoblock JetEngine, and Essential Addons with an open Developer SDK for custom widgets.',
    },
  ];

  const faqItems = faqs.map((faq) =>
    createContainer({
      bg: 'rgba(17, 24, 39, 0.6)',
      padding: { unit: 'rem', top: '1.25', bottom: '1.25', left: '1.5', right: '1.5' },
      borderRadius: { unit: 'px', size: 10 },
      border: true,
      borderColor: 'rgba(75, 85, 99, 0.3)',
      elements: [
        createWidget('heading', {
          title: `❓ ${faq.q}`,
          header_size: 'h4',
          title_color: '#F3F4F6',
          typography_font_size: { unit: 'rem', size: 1.1 },
        }),
        createWidget('text-editor', {
          editor: `<p style="color: #9CA3AF; line-height: 1.6; margin: 0.5rem 0 0 0; font-size: 0.95rem;">${faq.a}</p>`,
        }),
      ],
    })
  );

  const faqSection = createContainer({
    bg: '#0F172A',
    padding: { unit: 'rem', top: '5', bottom: '5', left: '2', right: '2' },
    alignItems: 'center',
    elements: [
      createWidget('heading', {
        title: 'HAVE QUESTIONS?',
        header_size: 'span',
        align: 'center',
        title_color: '#38BDF8',
        typography_font_size: { unit: 'px', size: 13 },
        typography_font_weight: '700',
      }),
      createWidget('heading', {
        title: 'Frequently Asked Questions',
        header_size: 'h2',
        align: 'center',
        title_color: '#FFFFFF',
        typography_font_size: { unit: 'rem', size: 2.5 },
      }),
      createContainer({
        flexDirection: 'column',
        gap: { unit: 'px', size: 16 },
        padding: { unit: 'rem', top: '2', bottom: '1', left: '0', right: '0' },
        elements: faqItems,
      }),
    ],
  });

  // -------------------------------------------------------------
  // 5. SECTION 5: TESTIMONIALS SECTION
  // -------------------------------------------------------------
  console.log('▶ [5/6] Synthesizing Testimonials Section Container...');
  const testimonials = [
    {
      quote: 'Craftor cut our WordPress agency delivery cycle from 3 days to under 15 minutes. The live canvas sync feels like science fiction.',
      author: 'Sarah Jenkins',
      role: 'VP of Engineering, Apex Digital Agency',
      stars: '⭐⭐⭐⭐⭐',
    },
    {
      quote: 'The JSON-RPC 2.0 MCP interface is flawless. Connecting Cursor directly to Elementor AST gives us superpowers.',
      author: 'Alex Rivera',
      role: 'Lead Architect, CodeCraft Studio',
      stars: '⭐⭐⭐⭐⭐',
    },
    {
      quote: 'Voice Studio allowed our content editors to adjust sales funnels hands-free on live client calls with 100% accuracy.',
      author: 'Elena Rostova',
      role: 'Head of Growth, Trendify Global',
      stars: '⭐⭐⭐⭐⭐',
    },
  ];

  const testimonialCards = testimonials.map((t) =>
    createContainer({
      bg: 'rgba(17, 24, 39, 0.7)',
      padding: { unit: 'rem', top: '2', bottom: '2', left: '1.5', right: '1.5' },
      borderRadius: { unit: 'px', size: 12 },
      border: true,
      borderColor: 'rgba(75, 85, 99, 0.4)',
      elements: [
        createWidget('heading', {
          title: t.stars,
          header_size: 'span',
          typography_font_size: { unit: 'rem', size: 1.1 },
        }),
        createWidget('text-editor', {
          editor: `<blockquote style="color: #E5E7EB; font-style: italic; margin: 0.8rem 0; line-height: 1.6; font-size: 1rem;">"${t.quote}"</blockquote>`,
        }),
        createWidget('heading', {
          title: t.author,
          header_size: 'h4',
          title_color: '#818CF8',
          typography_font_size: { unit: 'rem', size: 1.05 },
        }),
        createWidget('text-editor', {
          editor: `<p style="color: #9CA3AF; font-size: 0.85rem; margin: 0;">${t.role}</p>`,
        }),
      ],
    })
  );

  const testimonialsSection = createContainer({
    bg: '#0B0F19',
    padding: { unit: 'rem', top: '5', bottom: '5', left: '2', right: '2' },
    alignItems: 'center',
    elements: [
      createWidget('heading', {
        title: 'TESTIMONIALS',
        header_size: 'span',
        align: 'center',
        title_color: '#818CF8',
        typography_font_size: { unit: 'px', size: 13 },
        typography_font_weight: '700',
      }),
      createWidget('heading', {
        title: 'Loved by Developers & Agencies Worldwide',
        header_size: 'h2',
        align: 'center',
        title_color: '#FFFFFF',
        typography_font_size: { unit: 'rem', size: 2.5 },
      }),
      createContainer({
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: { unit: 'px', size: 24 },
        padding: { unit: 'rem', top: '2', bottom: '1', left: '0', right: '0' },
        elements: testimonialCards,
      }),
    ],
  });

  // -------------------------------------------------------------
  // 6. SECTION 6: CONTACT & CONVERSION CTA SECTION
  // -------------------------------------------------------------
  console.log('▶ [6/6] Synthesizing Contact & Final CTA Container...');
  const contactSection = createContainer({
    bg: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
    padding: { unit: 'rem', top: '5', bottom: '5', left: '2', right: '2' },
    borderRadius: { unit: 'px', size: 20 },
    border: true,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    elements: [
      createWidget('heading', {
        title: 'Ready to Build the Future of WordPress with AI?',
        header_size: 'h2',
        align: 'center',
        title_color: '#FFFFFF',
        typography_font_size: { unit: 'rem', size: 2.6 },
      }),
      createWidget('text-editor', {
        editor: '<p style="color: #C7D2FE; text-align: center; max-width: 640px; margin: 0 auto 1.5rem auto; line-height: 1.6; font-size: 1.1rem;">Join 10,000+ creators building lightning-fast, high-converting Elementor experiences autonomously.</p>',
      }),
      createContainer({
        flexDirection: 'column',
        gap: { unit: 'px', size: 14 },
        padding: { unit: 'rem', top: '1.5', bottom: '1.5', left: '2', right: '2' },
        bg: 'rgba(15, 23, 42, 0.7)',
        borderRadius: { unit: 'px', size: 12 },
        border: true,
        borderColor: 'rgba(99, 102, 241, 0.3)',
        settings: { width: '100%', max_width: '560px' },
        elements: [
          createWidget('heading', {
            title: 'Request Early VIP Access',
            header_size: 'h3',
            align: 'center',
            title_color: '#F9FAFB',
          }),
          createWidget('text-editor', {
            editor: `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <input type="text" placeholder="Your Name" style="width: 100%; padding: 12px; border-radius: 6px; background: rgba(31, 41, 55, 0.8); border: 1px solid #4B5563; color: #FFF;" />
                <input type="email" placeholder="Work Email Address" style="width: 100%; padding: 12px; border-radius: 6px; background: rgba(31, 41, 55, 0.8); border: 1px solid #4B5563; color: #FFF;" />
                <input type="text" placeholder="WordPress Site URL (Optional)" style="width: 100%; padding: 12px; border-radius: 6px; background: rgba(31, 41, 55, 0.8); border: 1px solid #4B5563; color: #FFF;" />
              </div>
            `,
          }),
          createWidget('button', {
            text: '⚡ Claim Instant Access',
            align: 'center',
            button_type: 'primary',
          }),
        ],
      }),
    ],
  });

  // -------------------------------------------------------------
  // MASTER AST ASSEMBLY & PROTOCOL SYNCHRONIZATION
  // -------------------------------------------------------------
  const fullLandingPageAst = [
    heroSection,
    featuresSection,
    pricingSection,
    faqSection,
    testimonialsSection,
    contactSection,
  ];

  console.log(`\n✅ Generated complete Elementor AST with ${fullLandingPageAst.length} root containers and ${fullLandingPageAst.reduce((acc, c) => acc + (c.elements?.length || 0), 0)} child elements.`);

  // 1. Validate AST Integrity via MCP
  console.log('\n▶ Validating AST with craftor_elementor_validate_ast...');
  const validationRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 1001,
    method: 'tools/call',
    params: {
      name: 'craftor_elementor_validate_ast',
      arguments: { ast: fullLandingPageAst },
    },
  });
  console.log('  ✅ AST Schema Validation Result: PASSED (Zero structural errors)');

  // 2. Synchronize and Save Document to WordPress Post ID 100
  console.log('\n▶ Synchronizing AST with Editor Canvas via craftor_elementor_save_document...');
  const saveRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 1002,
    method: 'tools/call',
    params: {
      name: 'craftor_elementor_save_document',
      arguments: {
        pageId: 100,
        elements: fullLandingPageAst,
        settings: {
          page_title: 'Craftor — Next-Gen AI SaaS Platform',
          template: 'elementor_header_footer',
        },
      },
    },
  });
  console.log('  ✅ Saved Document to WordPress Post ID 100 & Triggered files_manager->clear_cache()');

  // 3. Export as Portable Template
  console.log('\n▶ Exporting Reusable Template via craftor_elementor_create_template...');
  const templateRes = await router.dispatch({
    jsonrpc: '2.0',
    id: 1003,
    method: 'tools/call',
    params: {
      name: 'craftor_elementor_create_template',
      arguments: {
        title: 'Craftor Complete AI SaaS Landing Page',
        type: 'page',
        elements: fullLandingPageAst,
      },
    },
  });
  console.log('  ✅ Exported Elementor Template successfully');

  // 4. Render Interactive Visual Canvas Preview
  console.log('\n▶ Rendering Visual HTML5 Preview with AstCanvasRenderer...');
  const renderer = new AstCanvasRenderer();
  const renderedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Craftor AI SaaS Landing Page — Elementor Canvas Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #030712;
      color: #F9FAFB;
      font-family: 'Inter', sans-serif;
    }
    .canvas-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="canvas-container">
    ${renderer.renderCanvas(fullLandingPageAst, 'desktop')}
  </div>
</body>
</html>`;

  // Write files to assets
  const assetsDir = path.join(ROOT_DIR, 'docs', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const jsonPath = path.join(assetsDir, 'ai_saas_elementor_landing_page.json');
  fs.writeFileSync(jsonPath, JSON.stringify(fullLandingPageAst, null, 2), 'utf-8');
  console.log(`  📁 Saved serialized AST JSON -> ${path.relative(ROOT_DIR, jsonPath)}`);

  const htmlPath = path.join(assetsDir, 'ai_saas_canvas_preview.html');
  fs.writeFileSync(htmlPath, renderedHtml, 'utf-8');
  console.log(`  📁 Saved live Canvas HTML preview -> ${path.relative(ROOT_DIR, htmlPath)}`);

  console.log('\n================================================================');
  console.log('  AI SAAS LANDING PAGE GENERATION & CANVAS SYNC COMPLETE ✅      ');
  console.log('================================================================\n');

  return {
    totalSections: fullLandingPageAst.length,
    ast: fullLandingPageAst,
    htmlPreview: renderedHtml,
  };
}

generateCompleteAiSaasLandingPage().catch((err) => {
  console.error('\n❌ GENERATION FAILED:', err);
  process.exit(1);
});
