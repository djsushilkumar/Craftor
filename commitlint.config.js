module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'mcp-server',
        'tool-registry',
        'skill-registry',
        'agent-registry',
        'workflow-registry',
        'schemas',
        'client-adapters',
        'elementor-ast',
        'design-tokens',
        'shared-ui',
        'shared-types',
        'shared-utils',
        'craftor-core',
        'craftor-pro',
        'craftor-enterprise',
        'dashboard',
        'api-gateway',
        'documentation',
        'marketing',
        'monorepo'
      ]
    ]
  }
};
