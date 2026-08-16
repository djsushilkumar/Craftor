import { IClientAdapter, ClientConfigResult } from '../../shared/dist/index';

export class AntigravityClientAdapter implements IClientAdapter {
  public readonly clientId = 'antigravity';
  public readonly displayName = 'Google Antigravity IDE';

  public generateConfig(siteUrl: string, secretToken: string): ClientConfigResult {
    const config = {
      mcpServers: {
        craftor: {
          command: 'npx',
          args: ['-y', '@craftor/mcp-server@latest', '--site', siteUrl, '--token', secretToken],
        },
      },
    };

    return {
      fileName: 'mcp_config.json',
      filePathSnippet: '.agents/mcp_config.json',
      configContent: JSON.stringify(config, null, 2),
    };
  }
}
