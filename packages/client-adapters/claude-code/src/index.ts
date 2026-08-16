import { IClientAdapter, ClientConfigResult } from '../../shared/dist/index';

export class ClaudeCodeClientAdapter implements IClientAdapter {
  public readonly clientId = 'claude-code';
  public readonly displayName = 'Claude Code (CLI)';

  public generateConfig(siteUrl: string, secretToken: string): ClientConfigResult {
    return {
      fileName: 'claude-code-setup.sh',
      filePathSnippet: 'terminal command',
      configContent: `claude mcp add craftor npx -y @craftor/mcp-server@latest --site ${siteUrl} --token ${secretToken}`
    };
  }
}
