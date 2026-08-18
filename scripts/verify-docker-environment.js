/**
 * Craftor Live Docker / WordPress Environment Verifier
 * Validates connectivity, active plugin status (Elementor, WooCommerce, Craftor Core),
 * and REST API routes on the running WordPress instance.
 */

const http = require('http');

const SITE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8080';
const API_TOKEN = process.env.WORDPRESS_API_TOKEN || 'crf_test_live_token_2026';

function fetchJson(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, SITE_URL);
    const req = http.request(
      url,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Craftor-Verifier/1.0',
          ...headers,
        },
        timeout: 5000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data });
          } catch {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
    req.end();
  });
}

async function verifyEnvironment() {
  console.log('================================================================');
  console.log('       CRAFTOR LIVE WORDPRESS ENVIRONMENT VERIFIER               ');
  console.log('================================================================\n');
  console.log(`Target Site URL : ${SITE_URL}`);
  console.log(`API Token       : ${API_TOKEN.substring(0, 8)}... (Length: ${API_TOKEN.length})\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. WordPress Core REST Root
    console.log('[1/4] Probing WordPress REST API Root (/wp-json/)...');
    const rootRes = await fetchJson('/wp-json/');
    assert(rootRes.statusCode === 200, `WordPress REST API responded with HTTP ${rootRes.statusCode}`);
    assert(
      rootRes.data && rootRes.data.namespaces && rootRes.data.namespaces.includes('craftor/v1'),
      'Craftor REST namespace "craftor/v1" is registered in WordPress'
    );

    // 2. Craftor Plugins & Environment Status (Authenticated)
    console.log('\n[2/4] Testing Authenticated Craftor Plugins API (/site/plugins)...');
    const pluginsRes = await fetchJson('/wp-json/craftor/v1/site/plugins', {
      'X-Craftor-Token': API_TOKEN,
    });
    assert(pluginsRes.statusCode === 200, `Craftor plugins endpoint responded with HTTP ${pluginsRes.statusCode}`);
    if (Array.isArray(pluginsRes.data)) {
      const activePlugins = pluginsRes.data.filter((p) => p.isActive).map((p) => p.name);
      console.log(`     - Active Plugins : ${activePlugins.join(', ')}`);
      const hasElementor = pluginsRes.data.some((p) => p.isActive && (p.name.includes('Elementor') || p.file.includes('elementor')));
      const hasWooCommerce = pluginsRes.data.some((p) => p.isActive && (p.name.includes('WooCommerce') || p.file.includes('woocommerce')));
      const hasCraftor = pluginsRes.data.some((p) => p.isActive && p.file.includes('craftor-core'));
      assert(hasElementor, 'Elementor plugin is installed and active in WordPress');
      assert(hasWooCommerce, 'WooCommerce plugin is installed and active in WordPress');
      assert(hasCraftor, 'Craftor Core plugin is installed and active in WordPress');
    }

    // 3. Unauthenticated Rejection (Zero-Trust)
    console.log('\n[3/4] Verifying Zero-Trust Rejection for Missing Token...');
    const unauthRes = await fetchJson('/wp-json/craftor/v1/site/plugins');
    assert(
      unauthRes.statusCode === 401 || unauthRes.statusCode === 403,
      `Unauthenticated REST request correctly rejected with HTTP ${unauthRes.statusCode}`
    );

    // 4. Elementor Tokens API
    console.log('\n[4/4] Verifying Elementor Global Kit Tokens API...');
    const tokensRes = await fetchJson('/wp-json/craftor/v1/elementor/tokens', {
      'X-Craftor-Token': API_TOKEN,
    });
    assert(tokensRes.statusCode === 200, `Elementor tokens responded with HTTP ${tokensRes.statusCode}`);

    console.log('\n================================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} Passed | ${failed} Failed`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
    console.log('🚀 LIVE WORDPRESS ENVIRONMENT IS 100% HEALTHY & READY FOR GOLDEN PATH!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [ENVIRONMENT UNREACHABLE]', err.message);
    console.log('\n================================================================');
    console.log('DOCKER STATUS: DOCKER CONTAINER IS NOT RUNNING ON THIS HOST');
    console.log('================================================================\n');
    process.exit(2);
  }
}

verifyEnvironment();
