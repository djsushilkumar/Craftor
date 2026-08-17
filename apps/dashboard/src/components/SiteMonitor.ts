/**
 * Craftor Multi-Site Live Monitor Component
 * Tracks health, active SSE sync connections, and ping latencies across connected WordPress instances.
 */

import { WordPressSiteTenant } from '../types.js';

export class SiteMonitor {
  private sites: Map<string, WordPressSiteTenant> = new Map();

  constructor(initialSites?: WordPressSiteTenant[]) {
    if (initialSites) {
      for (const site of initialSites) {
        this.sites.set(site.id, site);
      }
    } else {
      // Default demo tenant sites
      this.addSite({
        id: 'site_prod_1',
        name: 'Apex Digital Agency (Primary)',
        url: 'https://apexstudio.wp',
        version: '6.7.1',
        elementorVersion: '3.24.5',
        status: 'ONLINE',
        lastPingMs: 24,
        activeSnapshotsCount: 14,
        mcpConnected: true,
      });
      this.addSite({
        id: 'site_staging_1',
        name: 'Staging Store (WooCommerce)',
        url: 'https://staging.apexstudio.wp',
        version: '6.7.1',
        elementorVersion: '3.24.5',
        status: 'SYNCING',
        lastPingMs: 42,
        activeSnapshotsCount: 8,
        mcpConnected: true,
      });
    }
  }

  public addSite(site: WordPressSiteTenant): void {
    this.sites.set(site.id, site);
  }

  public getSites(): WordPressSiteTenant[] {
    return Array.from(this.sites.values());
  }

  public getSite(id: string): WordPressSiteTenant | undefined {
    return this.sites.get(id);
  }

  public updatePing(id: string, pingMs: number, status: WordPressSiteTenant['status']): void {
    const site = this.sites.get(id);
    if (site) {
      site.lastPingMs = pingMs;
      site.status = status;
    }
  }

  /**
   * Generates a modern glassmorphic HTML card deck for the active sites.
   */
  public renderHtml(): string {
    const sites = this.getSites();
    return `
      <div class="site-monitor-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${sites
          .map(
            (s) => `
          <div class="site-card" id="site-${s.id}" style="background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(75, 85, 99, 0.4); border-radius: 12px; padding: 1.25rem; transition: transform 0.2s ease, border-color 0.2s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h3 style="margin: 0; font-size: 1.1rem; color: #F9FAFB; font-weight: 600;">${s.name}</h3>
              <span class="status-badge" style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 9999px; font-weight: 600; background: ${
                s.status === 'ONLINE'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : s.status === 'SYNCING'
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)'
              }; color: ${
              s.status === 'ONLINE' ? '#10B981' : s.status === 'SYNCING' ? '#3B82F6' : '#EF4444'
            }; border: 1px solid ${
              s.status === 'ONLINE' ? '#10B981' : s.status === 'SYNCING' ? '#3B82F6' : '#EF4444'
            }40;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
                ${s.status}
              </span>
            </div>
            <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #9CA3AF; font-family: monospace;">${s.url}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem; color: #D1D5DB; background: rgba(31, 41, 55, 0.6); padding: 0.75rem; border-radius: 8px;">
              <div>WP / Elementor: <strong>${s.version} / ${s.elementorVersion}</strong></div>
              <div>Ping Latency: <strong style="color: ${s.lastPingMs < 50 ? '#10B981' : '#F59E0B'};">${s.lastPingMs}ms</strong></div>
              <div>Snapshots: <strong>${s.activeSnapshotsCount} active</strong></div>
              <div>MCP Protocol: <strong style="color: #10B981;">Connected (Stdio)</strong></div>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }
}
