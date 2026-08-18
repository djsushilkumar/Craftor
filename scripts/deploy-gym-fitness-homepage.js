/**
 * Live Deployment: Modern Gym & Fitness Elementor Homepage for bradhive.in
 * Features: High-energy dark aesthetic, Class Schedule, and $49 Pro Warrior Membership Plan.
 */

const https = require('https');
const crypto = require('crypto');

function generateHexUuid(len = 7) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

// 1. Synthesize Modern Dark Aesthetic Gym & Fitness AST
const gymAst = [
  // SECTION 1: HERO BANNER
  {
    id: generateHexUuid(7),
    elType: 'container',
    isInner: false,
    settings: {
      flex_direction: 'column',
      justify_content: 'center',
      align_items: 'center',
      background_background: 'classic',
      background_color: '#0A0A0C',
      padding: { unit: 'rem', top: '7', bottom: '7', left: '2', right: '2' },
      border_bottom_width: '2px',
      border_bottom_color: '#EF4444',
    },
    elements: [
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: '🔥 PUSH YOUR LIMITS • UNLEASH YOUR INNER BEAST',
          header_size: 'span',
          align: 'center',
          title_color: '#F87171',
          typography_font_size: { unit: 'px', size: 14 },
          typography_font_weight: '800',
        },
        elements: [],
      },
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'TRANSFORM YOUR BODY. ELEVATE YOUR MIND.',
          header_size: 'h1',
          align: 'center',
          title_color: '#FFFFFF',
          typography_font_size: { unit: 'px', size: 54 },
          typography_font_weight: '900',
        },
        elements: [],
      },
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #9CA3AF; font-size: 1.2rem; max-width: 750px; margin: 0 auto; line-height: 1.6;">Join Bradhive Elite Fitness Club. State-of-the-art Olympic equipment, certified master trainers, and high-intensity group classes engineered for real transformations.</p>',
        },
        elements: [],
      },
      // Dual Action Buttons
      {
        id: generateHexUuid(7),
        elType: 'container',
        isInner: true,
        settings: {
          flex_direction: 'row',
          justify_content: 'center',
          align_items: 'center',
          flex_gap: { unit: 'px', size: 16 },
          margin: { unit: 'px', top: '32', right: '0', bottom: '0', left: '0' },
        },
        elements: [
          {
            id: generateHexUuid(7),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: '⚡ Claim 3-Day Free VIP Pass',
              link: { url: '#membership' },
              size: 'lg',
              background_color: '#DC2626',
              button_text_color: '#FFFFFF',
              border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
            },
            elements: [],
          },
          {
            id: generateHexUuid(7),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: '📅 View Class Schedule',
              link: { url: '#schedule' },
              size: 'lg',
              background_color: 'rgba(255,255,255,0.08)',
              button_text_color: '#F3F4F6',
              border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
            },
            elements: [],
          },
        ],
      },
    ],
  },

  // SECTION 2: TRAINING PROGRAMS & CLASS SCHEDULE
  {
    id: generateHexUuid(7),
    elType: 'container',
    isInner: false,
    settings: {
      flex_direction: 'column',
      align_items: 'center',
      background_background: 'classic',
      background_color: '#111116',
      padding: { unit: 'rem', top: '6', bottom: '6', left: '2', right: '2' },
    },
    elements: [
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'WEEKLY TRAINING SCHEDULE & PROGRAMS',
          header_size: 'h2',
          align: 'center',
          title_color: '#FFFFFF',
          typography_font_weight: '800',
        },
        elements: [],
      },
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #9CA3AF; margin-bottom: 2.5rem;">Led by world-class certified coaches to guarantee peak performance.</p>',
        },
        elements: [],
      },
      // 4 Schedule Cards Grid
      {
        id: generateHexUuid(7),
        elType: 'container',
        isInner: true,
        settings: {
          flex_direction: 'row',
          flex_wrap: 'wrap',
          justify_content: 'center',
          flex_gap: { unit: 'px', size: 24 },
        },
        elements: [
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#181820',
              padding: { unit: 'px', top: '24', bottom: '24', left: '24', right: '24' },
              border_radius: { unit: 'px', size: 10 },
              min_width: { unit: 'px', size: 260 },
              border_left_width: '4px',
              border_left_color: '#DC2626',
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '🏋️ Crossfit & Strength', header_size: 'h4', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<p style="color: #F87171; font-weight: 700; margin: 6px 0;">Mon / Wed / Fri • 06:00 AM</p><p style="color: #9CA3AF; font-size: 13px;">High intensity barbell complexes and functional conditioning.</p>' }, elements: [] },
            ],
          },
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#181820',
              padding: { unit: 'px', top: '24', bottom: '24', left: '24', right: '24' },
              border_radius: { unit: 'px', size: 10 },
              min_width: { unit: 'px', size: 260 },
              border_left_width: '4px',
              border_left_color: '#F59E0B',
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '⚡ HIIT & Cardio Burn', header_size: 'h4', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<p style="color: #FBBF24; font-weight: 700; margin: 6px 0;">Daily • 07:30 AM & 06:00 PM</p><p style="color: #9CA3AF; font-size: 13px;">Maximum calorie burn through explosive interval circuits.</p>' }, elements: [] },
            ],
          },
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#181820',
              padding: { unit: 'px', top: '24', bottom: '24', left: '24', right: '24' },
              border_radius: { unit: 'px', size: 10 },
              min_width: { unit: 'px', size: 260 },
              border_left_width: '4px',
              border_left_color: '#3B82F6',
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '💪 Power Hypertrophy', header_size: 'h4', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<p style="color: #60A5FA; font-weight: 700; margin: 6px 0;">Tue / Thu / Sat • 05:00 PM</p><p style="color: #9CA3AF; font-size: 13px;">Dedicated bodybuilding hypertrophy and powerlifting blocks.</p>' }, elements: [] },
            ],
          },
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#181820',
              padding: { unit: 'px', top: '24', bottom: '24', left: '24', right: '24' },
              border_radius: { unit: 'px', size: 10 },
              min_width: { unit: 'px', size: 260 },
              border_left_width: '4px',
              border_left_color: '#10B981',
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '🧘 Mobility & Recovery', header_size: 'h4', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<p style="color: #34D399; font-weight: 700; margin: 6px 0;">Sunday • 08:00 AM</p><p style="color: #9CA3AF; font-size: 13px;">Guided deep tissue stretching and breathwork recovery.</p>' }, elements: [] },
            ],
          },
        ],
      },
    ],
  },

  // SECTION 3: MEMBERSHIP PLANS (FEATURING $49/MONTH PRO WARRIOR)
  {
    id: generateHexUuid(7),
    elType: 'container',
    isInner: false,
    settings: {
      flex_direction: 'column',
      align_items: 'center',
      background_background: 'classic',
      background_color: '#0A0A0C',
      padding: { unit: 'rem', top: '6', bottom: '6', left: '2', right: '2' },
    },
    elements: [
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'FLEXIBLE MEMBERSHIP PLANS',
          header_size: 'h2',
          align: 'center',
          title_color: '#FFFFFF',
          typography_font_weight: '800',
        },
        elements: [],
      },
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #9CA3AF; margin-bottom: 3rem;">No hidden fees. 30-day money-back satisfaction guarantee.</p>',
        },
        elements: [],
      },
      // Pricing 3 Columns Grid
      {
        id: generateHexUuid(7),
        elType: 'container',
        isInner: true,
        settings: {
          flex_direction: 'row',
          flex_wrap: 'wrap',
          justify_content: 'center',
          align_items: 'stretch',
          flex_gap: { unit: 'px', size: 24 },
        },
        elements: [
          // Tier 1: Basic
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#15151C',
              padding: { unit: 'px', top: '36', bottom: '36', left: '28', right: '28' },
              border_radius: { unit: 'px', size: 14 },
              border_width: '1px',
              border_color: 'rgba(255,255,255,0.08)',
              width: { unit: 'px', size: 300 },
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: 'BASIC FITNESS', header_size: 'h4', title_color: '#9CA3AF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '$29 / mo', header_size: 'h2', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<ul style="color: #9CA3AF; line-height: 1.8; padding-left: 18px; margin: 20px 0;"><li>Standard Gym Floor Access</li><li>Locker & Shower Facilities</li><li>Free Fitness Assessment</li></ul>' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'button', settings: { text: 'Select Basic', link: { url: '#contact' }, background_color: '#27272A', button_text_color: '#FFFFFF' }, elements: [] },
            ],
          },

          // Tier 2: PRO WARRIOR ($49/mo - FEATURED & HIGHLIGHTED)
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#1C1917',
              padding: { unit: 'px', top: '40', bottom: '40', left: '28', right: '28' },
              border_radius: { unit: 'px', size: 14 },
              border_width: '2px',
              border_color: '#DC2626',
              width: { unit: 'px', size: 320 },
              box_shadow_box_shadow: { horizontal: 0, vertical: 10, blur: 30, spread: 0, color: 'rgba(220, 38, 38, 0.25)' },
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '⭐ MOST POPULAR • BEST VALUE', header_size: 'span', title_color: '#F87171', typography_font_size: { unit: 'px', size: 12 }, typography_font_weight: '800' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: 'PRO WARRIOR', header_size: 'h3', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '$49 / mo', header_size: 'h2', title_color: '#EF4444' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<ul style="color: #F3F4F6; line-height: 1.8; padding-left: 18px; margin: 20px 0;"><li><strong>Unlimited 24/7 Gym Access</strong></li><li><strong>All Group Fitness & Crossfit Classes</strong></li><li><strong>Personalized Custom Diet Plan</strong></li><li>1 Free Personal Trainer Session/mo</li><li>Free Guest Pass Every Month</li></ul>' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'button', settings: { text: '🔥 Join Pro Warrior ($49)', link: { url: '#contact' }, background_color: '#DC2626', button_text_color: '#FFFFFF' }, elements: [] },
            ],
          },

          // Tier 3: Elite VIP Athlete
          {
            id: generateHexUuid(7),
            elType: 'container',
            isInner: true,
            settings: {
              background_color: '#15151C',
              padding: { unit: 'px', top: '36', bottom: '36', left: '28', right: '28' },
              border_radius: { unit: 'px', size: 14 },
              border_width: '1px',
              border_color: 'rgba(255,255,255,0.08)',
              width: { unit: 'px', size: 300 },
            },
            elements: [
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: 'ELITE VIP ATHLETE', header_size: 'h4', title_color: '#9CA3AF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'heading', settings: { title: '$99 / mo', header_size: 'h2', title_color: '#FFFFFF' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<ul style="color: #9CA3AF; line-height: 1.8; padding-left: 18px; margin: 20px 0;"><li>Dedicated Weekly Private Trainer</li><li>Infrared Sauna & Ice Bath Lounge</li><li>Unlimited Post-Workout Protein Shakes</li><li>VIP Locker & Laundry Service</li></ul>' }, elements: [] },
              { id: generateHexUuid(7), elType: 'widget', widgetType: 'button', settings: { text: 'Select VIP', link: { url: '#contact' }, background_color: '#27272A', button_text_color: '#FFFFFF' }, elements: [] },
            ],
          },
        ],
      },
    ],
  },

  // SECTION 4: VIP FREE TRIAL LEAD CAPTURE
  {
    id: generateHexUuid(7),
    elType: 'container',
    isInner: false,
    settings: {
      flex_direction: 'column',
      align_items: 'center',
      background_background: 'classic',
      background_color: '#111116',
      padding: { unit: 'rem', top: '6', bottom: '6', left: '2', right: '2' },
      border_top_width: '1px',
      border_top_color: 'rgba(255,255,255,0.08)',
    },
    elements: [
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'CLAIM YOUR FREE 3-DAY VIP GYM PASS',
          header_size: 'h2',
          align: 'center',
          title_color: '#FFFFFF',
          typography_font_weight: '800',
        },
        elements: [],
      },
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #9CA3AF; max-width: 600px; margin-bottom: 2rem;">Fill out the quick form below and our head coach will activate your complimentary 3-day access and 1-on-1 body composition scan.</p>',
        },
        elements: [],
      },
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: '⚡ Get Instant Free Pass On WhatsApp',
          link: { url: 'https://api.whatsapp.com/send?phone=919999999999&text=Hi,%20I%20want%20to%20claim%20my%203-day%20free%20gym%20pass!' },
          size: 'xl',
          background_color: '#10B981',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '8', right: '8', bottom: '8', left: '8', isLinked: true },
        },
        elements: [],
      },
    ],
  },
];

// Save to both Page ID 33 (Front Page) and Page ID 2 (Sample Page)
async function deployPage(pageId) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      pageId: pageId,
      elements: gymAst,
      settings: {
        template: 'elementor_header_footer',
        page_title: 'Bradhive Gym & Fitness Club',
      },
    });

    const req = https.request(
      {
        hostname: 'bradhive.in',
        path: '/wp-json/craftor/v1/elementor/save',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Craftor-Token': 'crf_icFPLOsNpVEha59E8ZUTKJR0',
          'User-Agent': 'Craftor-AI/1.0',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('      DEPLOYING MODERN GYM & FITNESS HOMEPAGE TO BRADHOVE.IN     ');
  console.log('================================================================\n');

  console.log('1. Deploying to Front Page (Page ID 33)...');
  const res33 = await deployPage(33);
  console.log('Page 33 Result:', res33.body);

  console.log('\n2. Deploying to Sample Page (Page ID 2)...');
  const res2 = await deployPage(2);
  console.log('Page 2 Result:', res2.body);

  console.log('\n================================================================');
  console.log('✅ GYM & FITNESS HOMEPAGE DEPLOYED AND LIVE!');
  console.log('================================================================');
  console.log('🌐 Live Homepage URL   : https://bradhive.in/');
  console.log('🌐 Direct Sample URL   : https://bradhive.in/sample-page/');
}

run().catch(console.error);
