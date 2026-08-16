export class UpdateService {
  public static getLatestRelease(channel: 'stable' | 'beta' | 'canary' = 'stable'): { version: string; channel: string } {
    return {
      version: '1.0.0',
      channel
    };
  }
}
