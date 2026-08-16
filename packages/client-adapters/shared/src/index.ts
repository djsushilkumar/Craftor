export interface ClientConfigResult {
  fileName: string;
  filePathSnippet: string;
  configContent: string;
}

export interface IClientAdapter {
  readonly clientId: string;
  readonly displayName: string;
  generateConfig(siteUrl: string, secretToken: string): ClientConfigResult;
}
