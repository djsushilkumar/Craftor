/**
 * Live Elementor AST Hero Section Generator & Dispatcher for bradhive.in (Page ID 2)
 */

const https = require('https');
const crypto = require('crypto');

function generateHexUuid(len = 7) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

// 1. Build Modern Luxury Glassmorphic Hero Section AST
const heroSectionAst = [
  {
    id: generateHexUuid(7),
    elType: 'container',
    isInner: false,
    settings: {
      flex_direction: 'column',
      justify_content: 'center',
      align_items: 'center',
      background_background: 'classic',
      background_color: '#0B0F19',
      padding: {
        unit: 'px',
        top: '100',
        right: '24',
        bottom: '100',
        left: '24',
        isLinked: false,
      },
      border_radius: {
        unit: 'px',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        isLinked: true,
      },
    },
    elements: [
      // Badge / Pill
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: '⚡ POWERING NEXT-GEN DIGITAL EXPERIENCES',
          header_size: 'p',
          align: 'center',
          title_color: '#38BDF8',
        },
        elements: [],
      },
      // Main H1 Title
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'Scale Your Business With Autonomous AI Infrastructure',
          header_size: 'h1',
          align: 'center',
          title_color: '#FFFFFF',
        },
        elements: [],
      },
      // Lead Subtitle
      {
        id: generateHexUuid(7),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #94A3B8; font-size: 1.15rem; max-width: 760px; margin: 0 auto; line-height: 1.6;">Craftor transforms your WordPress workflows into high-speed autonomous engines with direct Elementor AST synthesis, instant micro-rollbacks, and real-time canvas synchronization.</p>',
          align: 'center',
        },
        elements: [],
      },
      // Dual Buttons Row Container
      {
        id: generateHexUuid(7),
        elType: 'container',
        isInner: true,
        settings: {
          flex_direction: 'row',
          justify_content: 'center',
          align_items: 'center',
          flex_gap: { unit: 'px', size: 16 },
          margin: { unit: 'px', top: '32', right: '0', bottom: '0', left: '0', isLinked: false },
        },
        elements: [
          {
            id: generateHexUuid(7),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: '🚀 Start Free 14-Day Trial',
              link: { url: 'https://bradhive.in/contact' },
              size: 'lg',
              background_color: '#4F46E5',
              button_text_color: '#FFFFFF',
              border_radius: { unit: 'px', top: '8', right: '8', bottom: '8', left: '8', isLinked: true },
            },
            elements: [],
          },
          {
            id: generateHexUuid(7),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: '📺 Watch Live Demo',
              link: { url: 'https://bradhive.in/demo' },
              size: 'lg',
              background_color: 'rgba(255,255,255,0.08)',
              button_text_color: '#E2E8F0',
              border_radius: { unit: 'px', top: '8', right: '8', bottom: '8', left: '8', isLinked: true },
            },
            elements: [],
          },
        ],
      },
    ],
  },
];

// 2. Dispatch Live to bradhive.in REST API
const payload = JSON.stringify({
  pageId: 2,
  elements: heroSectionAst,
  settings: {
    template: 'elementor_header_footer',
  },
});

const options = {
  hostname: 'bradhive.in',
  path: '/wp-json/craftor/v1/elementor/save',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-Craftor-Token': 'crf_icFPLOsNpVEha59E8ZUTKJR0',
    'User-Agent': 'Craftor-AI/1.0',
  },
};

console.log('Sending Live Hero Section AST to https://bradhive.in/wp-json/craftor/v1/elementor/save for Page ID 2...');

const req = https.request(options, (res) => {
  console.log(`HTTP STATUS: ${res.statusCode}`);
  let responseData = '';
  res.on('data', (chunk) => (responseData += chunk));
  res.on('end', () => {
    console.log('RESPONSE DATA:', responseData);

    // Verify by reading the document back
    const getOptions = {
      hostname: 'bradhive.in',
      path: '/wp-json/craftor/v1/elementor/document/2',
      method: 'GET',
      headers: {
        'X-Craftor-Token': 'crf_icFPLOsNpVEha59E8ZUTKJR0',
        'User-Agent': 'Craftor-AI/1.0',
      },
    };

    https.get(getOptions, (getRes) => {
      let getBody = '';
      getRes.on('data', (d) => (getBody += d));
      getRes.on('end', () => {
        console.log('\nVERIFICATION FROM MYSQL (Page 2 Saved Document):');
        console.log(getBody);
      });
    });
  });
});

req.on('error', (e) => {
  console.error('HTTPS ERROR:', e.message);
});

req.write(payload);
req.end();
