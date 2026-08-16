import { IClientAdapter, ClientConfigResult } from '../../shared/dist/index';

export class VSCodeClientAdapter implements IClientAdapter {
  public readonly clientId = 'vscode';
  public readonly displayName = 'VS Code (MCP Extension)';

  public generateConfig(siteUrl: string, secretToken: string): ClientConfigResult {
    const config = {
      'mcp.servers': {
        craftor: {
          command: 'npx',
          args: ['-y', '@craftor/mcp-server@latest', '--site', siteUrl, '--token', secretToken],
        },
      },
    };

    return {
      fileName: 'settings.json',
      filePathSnippet: '.vscode/settings.json',
      configContent: JSON.stringify(config, null, 2),
    };
  }
}
