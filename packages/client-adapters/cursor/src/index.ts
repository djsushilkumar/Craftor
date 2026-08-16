import { IClientAdapter, ClientConfigResult } from '../../shared/dist/index';

export class CursorClientAdapter implements IClientAdapter {
  public readonly clientId = 'cursor';
  public readonly displayName = 'Cursor IDE';

  public generateConfig(siteUrl: string, secretToken: string): ClientConfigResult {
    const config = {
      mcpServers: {
        craftor: {
          command: 'npx',
          args: ['-y', '@craftor/mcp-server@latest', '--site', siteUrl, '--token', secretToken]
        }
      }
    };

    return {
      fileName: 'mcp.json',
      filePathSnippet: '.cursor/mcp.json',
      configContent: JSON.stringify(config, null, 2)
    };
  }
}
