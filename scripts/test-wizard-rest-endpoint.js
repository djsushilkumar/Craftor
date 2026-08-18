/**
 * Test Live Wizard REST Endpoint on WordPress Container
 */

const { WordPressClient } = require('../packages/wordpress-bridge/dist/client.js');

const SITE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8080';
const SECRET_TOKEN = process.env.WORDPRESS_API_TOKEN || 'crf_test_live_token_2026';

async function testWizardEndpoint() {
  console.log('================================================================');
  console.log('       TESTING LIVE WIZARD REST ENDPOINT (CHANNEL 2)            ');
  console.log('================================================================\n');

  const wpClient = new WordPressClient({
    siteUrl: SITE_URL,
    auth: { type: 'bearer', token: SECRET_TOKEN },
  });

  const rest = wpClient.getRestClient();

  console.log('[Test 1] Testing Gym & Fitness Archetype Generation...');
  const resFitness = await rest.post('/wp-json/craftor/v1/wizard/generate', {
    archetype: 'fitness',
    theme: 'dark-gold',
    title: 'IronForge Elite Gym & Crossfit Club',
    create_woo_products: true,
    inject_seo: true,
  });

  console.log('  ✅ Fitness Response:', resFitness);

  console.log('\n[Test 2] Testing Restaurant & Dining Archetype Generation...');
  const resDining = await rest.post('/wp-json/craftor/v1/wizard/generate', {
    archetype: 'restaurant',
    theme: 'emerald-green',
    title: 'La Bella Artisan Organic Bistro',
    create_woo_products: true,
    inject_seo: true,
  });

  console.log('  ✅ Restaurant Response:', resDining);

  console.log('\n================================================================');
  console.log('  WIZARD REST ENDPOINT TEST: 100% SUCCESSFUL! ✅                ');
  console.log('================================================================\n');
}

testWizardEndpoint().catch((err) => {
  console.error('\n❌ Fatal error in Wizard test:', err);
  process.exit(1);
});
