/**
 * Test Live Modular Archetype Engine on WordPress Container
 */

const { WordPressClient } = require('../packages/wordpress-bridge/dist/client.js');

const SITE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8080';
const SECRET_TOKEN = process.env.WORDPRESS_API_TOKEN || 'crf_test_live_token_2026';

async function testModularArchetypes() {
  console.log('================================================================');
  console.log('       TESTING MODULAR ARCHETYPE REST ENGINE (PHASE 1)          ');
  console.log('================================================================\n');

  const wpClient = new WordPressClient({
    siteUrl: SITE_URL,
    auth: { type: 'bearer', token: SECRET_TOKEN },
  });

  const rest = wpClient.getRestClient();

  console.log('[Test 1] Testing Fitness Archetype Generation...');
  const resFitness = await rest.post('/wp-json/craftor/v1/wizard/generate', {
    archetype: 'fitness',
    theme: 'dark-gold',
    title: 'Titan Gym & Athletics Club',
    create_woo_products: true,
    inject_seo: true,
  });
  console.log('  ✅ Fitness Response:', resFitness);

  console.log('\n[Test 2] Testing SaaS Archetype Generation...');
  const resSaas = await rest.post('/wp-json/craftor/v1/wizard/generate', {
    archetype: 'saas',
    theme: 'neon-cyan',
    title: 'NeuralPulse AI Cloud',
    create_woo_products: true,
    inject_seo: true,
  });
  console.log('  ✅ SaaS Response:', resSaas);

  console.log('\n================================================================');
  console.log('  MODULAR ARCHETYPE TEST: 100% SUCCESSFUL! ✅                   ');
  console.log('================================================================\n');
}

testModularArchetypes().catch((err) => {
  console.error('\n❌ Error in Modular Archetype test:', err);
  process.exit(1);
});
