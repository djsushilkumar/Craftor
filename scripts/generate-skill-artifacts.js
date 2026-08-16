/**
 * Generates the standardized 8 files for each of the 15 Craftor skills in .agents/skills/
 * - skill.md
 * - metadata.json
 * - system-prompt.md
 * - tools.json
 * - examples.md
 * - evals.json
 * - dependencies.json
 * - permissions.json
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.resolve(__dirname, '../.agents/skills');

const SKILLS = [
  {
    id: 'craftor-debugging-engineer',
    name: 'Craftor Debugging Engineer',
    role: 'Autonomous Debugging & Triage Engineer',
    permissions: ['manage_options', 'edit_posts'],
    tools: ['site_get_system_health', 'craftor_list_snapshots', 'craftor_restore_snapshot'],
    deps: ['craftor-wordpress-engineer', 'craftor-solution-architect']
  },
  {
    id: 'craftor-devops-engineer',
    name: 'Craftor DevOps Engineer',
    role: 'Autonomous DevOps & CI/CD Engineer',
    permissions: ['manage_options'],
    tools: ['site_get_system_health', 'craftor_verify_license'],
    deps: ['craftor-release-manager', 'craftor-security-engineer']
  },
  {
    id: 'craftor-documentation-writer',
    name: 'Craftor Documentation Writer',
    role: 'Autonomous Technical Documentation Engineer',
    permissions: ['read'],
    tools: ['tools_get_schema', 'site_get_system_health'],
    deps: ['craftor-product-manager', 'craftor-tool-registry-manager']
  },
  {
    id: 'craftor-elementor-engineer',
    name: 'Craftor Elementor Engineer',
    role: 'Autonomous Elementor AST & Canvas Specialist',
    permissions: ['edit_posts'],
    tools: ['elementor_get_page_ast', 'elementor_set_page_ast', 'elementor_create_container', 'elementor_add_widget', 'elementor_clear_css_cache'],
    deps: ['craftor-ui-ux-designer', 'craftor-wordpress-engineer']
  },
  {
    id: 'craftor-mcp-engineer',
    name: 'Craftor MCP Engineer',
    role: 'Autonomous Model Context Protocol (MCP) Specialist',
    permissions: ['manage_options', 'read'],
    tools: ['tools_get_schema', 'site_get_system_health'],
    deps: ['craftor-solution-architect', 'craftor-tool-registry-manager']
  },
  {
    id: 'craftor-product-manager',
    name: 'Craftor Product Manager',
    role: 'Autonomous Product Manager',
    permissions: ['read'],
    tools: ['tools_get_schema'],
    deps: ['craftor-solution-architect', 'craftor-qa-engineer']
  },
  {
    id: 'craftor-prompt-engineer',
    name: 'Craftor Prompt Engineer',
    role: 'Autonomous Prompt & Eval Specialist',
    permissions: ['read'],
    tools: ['tools_get_schema'],
    deps: ['craftor-elementor-engineer', 'craftor-woocommerce-engineer']
  },
  {
    id: 'craftor-qa-engineer',
    name: 'Craftor QA Engineer',
    role: 'Autonomous QA & Test Harness Engineer',
    permissions: ['read', 'manage_options'],
    tools: ['site_get_system_health', 'craftor_get_visual_diff'],
    deps: ['craftor-debugging-engineer', 'craftor-devops-engineer']
  },
  {
    id: 'craftor-release-manager',
    name: 'Craftor Release Manager',
    role: 'Autonomous Release & SemVer Coordinator',
    permissions: ['manage_options'],
    tools: ['craftor_verify_license', 'site_get_system_health'],
    deps: ['craftor-devops-engineer', 'craftor-qa-engineer']
  },
  {
    id: 'craftor-security-engineer',
    name: 'Craftor Security Engineer',
    role: 'Autonomous Zero-Trust Security Engineer',
    permissions: ['manage_options'],
    tools: ['craftor_verify_license', 'site_get_system_health'],
    deps: ['craftor-solution-architect', 'craftor-wordpress-engineer']
  },
  {
    id: 'craftor-solution-architect',
    name: 'Craftor Solution Architect',
    role: 'Autonomous Solution Architect & Protocol Designer',
    permissions: ['read', 'manage_options'],
    tools: ['tools_get_schema', 'site_get_system_health'],
    deps: ['craftor-product-manager', 'craftor-mcp-engineer']
  },
  {
    id: 'craftor-tool-registry-manager',
    name: 'Craftor Tool Registry Manager',
    role: 'Autonomous Tool Registry & Schema Curator',
    permissions: ['read'],
    tools: ['tools_get_schema'],
    deps: ['craftor-solution-architect', 'craftor-mcp-engineer']
  },
  {
    id: 'craftor-ui-ux-designer',
    name: 'Craftor UI/UX Designer',
    role: 'Autonomous UI/UX Design Specialist',
    permissions: ['edit_posts', 'read'],
    tools: ['elementor_get_global_kit', 'elementor_get_global_colors', 'elementor_get_global_typography'],
    deps: ['craftor-elementor-engineer', 'craftor-prompt-engineer']
  },
  {
    id: 'craftor-woocommerce-engineer',
    name: 'Craftor WooCommerce Engineer',
    role: 'Autonomous WooCommerce Specialist',
    permissions: ['manage_woocommerce'],
    tools: ['woo_get_product', 'woo_create_simple_product', 'woo_update_product', 'woo_get_order', 'woo_create_coupon'],
    deps: ['craftor-wordpress-engineer', 'craftor-elementor-engineer']
  },
  {
    id: 'craftor-wordpress-engineer',
    name: 'Craftor WordPress Core Engineer',
    role: 'Autonomous WordPress Core Specialist',
    permissions: ['edit_posts', 'manage_options'],
    tools: ['wp_get_post', 'wp_create_post', 'wp_update_post', 'wp_create_page', 'wp_register_cpt', 'wp_create_term'],
    deps: ['craftor-solution-architect', 'craftor-security-engineer']
  }
];

SKILLS.forEach(skill => {
  const dir = path.join(SKILLS_DIR, skill.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 1. metadata.json
  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify({
    id: skill.id,
    name: skill.name,
    role: skill.role,
    version: '1.0.0',
    accuracy_target: 0.985,
    status: 'active'
  }, null, 2));

  // 2. system-prompt.md
  fs.writeFileSync(path.join(dir, 'system-prompt.md'), `# ${skill.name} — System Prompt\n\nYou are ${skill.name}, operating as the ${skill.role} in the Craftor autonomous AI engineering organization. Enforce strict JSON Schema compliance, transactional snapshot safety, and zero regression.`);

  // 3. tools.json
  fs.writeFileSync(path.join(dir, 'tools.json'), JSON.stringify({
    bound_tools: skill.tools
  }, null, 2));

  // 4. examples.md
  fs.writeFileSync(path.join(dir, 'examples.md'), `# ${skill.name} — Usage Examples\n\n## Example 1: Standard Domain Invocation\n\`\`\`json\n{\n  "action": "execute",\n  "skill": "${skill.id}"\n}\n\`\`\``);

  // 5. evals.json
  fs.writeFileSync(path.join(dir, 'evals.json'), JSON.stringify({
    benchmark_id: `eval_${skill.id}`,
    target_pass_rate: 0.985,
    test_cases: [
      { "id": "test_001", "expected_tool": skill.tools[0] || "site_get_system_health" }
    ]
  }, null, 2));

  // 6. dependencies.json
  fs.writeFileSync(path.join(dir, 'dependencies.json'), JSON.stringify({
    upstream_skills: skill.deps,
    required_packages: ["@craftor/shared-types", "@craftor/schemas"]
  }, null, 2));

  // 7. permissions.json
  fs.writeFileSync(path.join(dir, 'permissions.json'), JSON.stringify({
    required_capabilities: skill.permissions
  }, null, 2));

  // 8. skill.md (copy from SKILL.md if not existing)
  const lowerSkillMd = path.join(dir, 'skill.md');
  const upperSkillMd = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(lowerSkillMd) && fs.existsSync(upperSkillMd)) {
    fs.copyFileSync(upperSkillMd, lowerSkillMd);
  } else if (!fs.existsSync(lowerSkillMd)) {
    fs.writeFileSync(lowerSkillMd, `# ${skill.name}\n\n${skill.role}`);
  }

  console.log(`[Generated] Standard 8 files for: ${skill.id}`);
});

console.log('All 15 skills standardized with 8 required files.');
