import { computeSha256 } from '../../../packages/shared-utils/dist/index';

export class AuthenticationService {
  public static hashToken(rawToken: string): string {
    return computeSha256(rawToken);
  }

  public static verifyToken(rawToken: string, storedHash: string): boolean {
    return this.hashToken(rawToken) === storedHash;
  }
}
