/**
 * Craftor Enterprise SSRF Validator (TypeScript)
 * Normalizes alternate IP representations and validates hostnames against private/reserved ranges and metadata endpoints.
 */

export interface SsrfValidationResult {
  safe: boolean;
  error?: string;
  normalizedIp?: string;
}

export class SsrfValidator {
  private static readonly BLOCKED_HOSTS = new Set([
    'localhost',
    'localhost.localdomain',
    'metadata.google.internal',
    'instance-data',
    '169.254.169.254',
    'metadata.azure.com',
  ]);

  /**
   * Validates a URL against all SSRF attack vectors.
   */
  public static validateUrl(urlString: string): SsrfValidationResult {
    if (!urlString || typeof urlString !== 'string') {
      return { safe: false, error: 'URL must be a non-empty string' };
    }

    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      return { safe: false, error: 'Malformed URL structure' };
    }

    // 1. Protocol Validation
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      return { safe: false, error: `Scheme "${protocol}" is not allowed. Only HTTP and HTTPS are permitted.` };
    }

    const rawHost = parsed.hostname.toLowerCase();
    const host = rawHost.replace(/^\[|\]$/g, '');

    // 2. Static Host Blacklist
    if (this.BLOCKED_HOSTS.has(host)) {
      return { safe: false, error: `Host "${host}" is a prohibited internal/metadata endpoint (SSRF Guard)` };
    }

    // 3. Normalize alternate IP literals
    const normalizedIp = this.normalizeIpLiteral(host);
    if (normalizedIp) {
      if (this.isProhibitedIp(normalizedIp)) {
        return { safe: false, error: `IP address "${normalizedIp}" is in a prohibited/private/loopback range`, normalizedIp };
      }
      return { safe: true, normalizedIp };
    }

    return { safe: true };
  }

  /**
   * Normalizes decimal, octal, hex, and mapped IP representations.
   */
  public static normalizeIpLiteral(host: string): string | null {
    // Pure decimal integer (e.g. 2130706433 -> 127.0.0.1)
    if (/^\d+$/.test(host)) {
      const num = parseInt(host, 10);
      if (num >= 0 && num <= 4294967295) {
        return this.longToIp(num);
      }
    }

    // Hexadecimal (e.g. 0x7f000001)
    if (/^0x[0-9a-f]+$/i.test(host)) {
      const num = parseInt(host, 16);
      if (num >= 0 && num <= 4294967295) {
        return this.longToIp(num);
      }
    }

    // Dotted quad with octal / hex / leading zeros (e.g. 0177.0.0.1 or 127.000.000.001)
    const parts = host.split('.');
    if (parts.length === 4) {
      const octets: number[] = [];
      for (const p of parts) {
        let val: number;
        if (p.startsWith('0x') || p.startsWith('0X')) {
          val = parseInt(p, 16);
        } else if (p.startsWith('0') && p.length > 1) {
          val = parseInt(p, 8);
        } else {
          val = parseInt(p, 10);
        }
        if (isNaN(val) || val < 0 || val > 255) {
          return null;
        }
        octets.push(val);
      }
      return octets.join('.');
    }

    // IPv6 loopback variants
    if (host === '::1' || host === '0:0:0:0:0:0:0:1' || host === '::') {
      return '::1';
    }

    // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1 or ::ffff:7f00:0001)
    if (host.startsWith('::ffff:') || host.startsWith('0:0:0:0:0:ffff:')) {
      const rest = host.replace(/^.*ffff:/i, '');
      if (rest.includes('.')) {
        return this.normalizeIpLiteral(rest);
      }
      const hexParts = rest.split(':');
      if (hexParts.length === 2 && hexParts[0] && hexParts[1]) {
        const high = parseInt(hexParts[0], 16);
        const low = parseInt(hexParts[1], 16);
        if (!isNaN(high) && !isNaN(low)) {
          return [
            (high >>> 8) & 255,
            high & 255,
            (low >>> 8) & 255,
            low & 255,
          ].join('.');
        }
      }
    }

    return null;
  }

  /**
   * Checks if an IP is in a private, loopback, link-local, or metadata range.
   */
  public static isProhibitedIp(ip: string): boolean {
    if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
      return true;
    }

    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const a = parts[0];
    const b = parts[1];
    if (a === undefined || b === undefined) {
      return true;
    }

    // 0.0.0.0/8
    if (a === 0) return true;
    // 10.0.0.0/8 (RFC1918)
    if (a === 10) return true;
    // 100.64.0.0/10 (CGNAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-Local & Cloud Metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (RFC1918)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (RFC1918)
    if (a === 192 && b === 168) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 (Reserved)
    if (a >= 240) return true;

    return false;
  }

  private static longToIp(num: number): string {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join('.');
  }
}
