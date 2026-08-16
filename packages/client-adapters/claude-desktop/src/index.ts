import { IClientAdapter, ClientConfigResult } from '../../shared/dist/index';

export class ClaudeDesktopClientAdapter implements IClientAdapter {
  public readonly clientId = 'claude-desktop';
  public readonly displayName = 'Claude Desktop';

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
      fileName: 'claude_desktop_config.json',
      filePathSnippet: 'AppData/Roaming/Claude/claude_desktop_config.json',
      configContent: JSON.stringify(config, null, 2),
    };
  }
}
