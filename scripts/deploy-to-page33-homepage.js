/**
 * Deploy Full 6-Section Homepage directly to the actual Front Page (Page ID 33) on bradhive.in
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const AST_FILE = path.join(__dirname, '..', 'docs', 'assets', 'ai_saas_elementor_landing_page.json');
const fullAst = JSON.parse(fs.readFileSync(AST_FILE, 'utf-8'));

console.log('================================================================');
console.log('    DEPLOYING FULL HOMEPAGE TO ACTUAL FRONT PAGE (PAGE ID 33)   ');
console.log('================================================================\n');

const payload = JSON.stringify({
  pageId: 33,
  elements: fullAst,
  settings: {
    template: 'elementor_header_footer',
    page_title: 'Home — Craftor AI',
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

const req = https.request(options, (res) => {
  console.log(`[HTTP RESPONSE] Status Code: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('[SAVE RESULT TO PAGE 33]:', body);

    // Verify root homepage directly
    setTimeout(() => {
      https.get('https://bradhive.in/', (rootRes) => {
        let rootBody = '';
        rootRes.on('data', (d) => (rootBody += d));
        rootRes.on('end', () => {
          console.log('\n================================================================');
          console.log('       LIVE ROOT HOMEPAGE VERIFICATION (https://bradhive.in/)    ');
          console.log('================================================================');
          console.log(`Root Status Code      : ${rootRes.statusCode}`);
          console.log(`Contains Craftor Title: ${rootBody.includes('Transform Ideas into WordPress Reality')}`);
          console.log(`Contains Pricing      : ${rootBody.includes('Starter Tier')}`);
          console.log(`Contains FAQ          : ${rootBody.includes('Frequently Asked Questions')}`);
          console.log(`Contains Testimonials : ${rootBody.includes('Trusted by 10,000+') || rootBody.includes('Sarah Jenkins')}`);
          console.log(`HTML Payload Size     : ${(rootBody.length / 1024).toFixed(2)} KB`);
          console.log('================================================================\n');
          console.log('🎉 Live URL: https://bradhive.in/');
        });
      });
    }, 1000);
  });
});

req.on('error', (err) => {
  console.error('HTTPS Error:', err.message);
});

req.write(payload);
req.end();
