import { IClientAdapter, ClientConfigResult } from '../../shared/dist/index';

export class CodexClientAdapter implements IClientAdapter {
  public readonly clientId = 'codex';
  public readonly displayName = 'Codex Scripting';

  public generateConfig(siteUrl: string, secretToken: string): ClientConfigResult {
    const config = {
      mcp: {
        server: 'craftor',
        endpoint: siteUrl,
        token: secretToken
      }
    };

    return {
      fileName: 'codex.config.json',
      filePathSnippet: 'codex.config.json',
      configContent: JSON.stringify(config, null, 2)
    };
  }
}
