export const DASHBOARD_METADATA = {
  title: 'Craftor SaaS Control Plane & Visual Web Studio',
  version: '1.2.0',
  endpoints: {
    sites: '/api/sites',
    providers: '/api/providers',
    licenses: '/api/licenses',
    telemetry: '/api/telemetry',
  },
};

export * from './types.js';
export * from './components/SiteMonitor.js';
export * from './components/AstCanvasRenderer.js';
export * from './components/PromptPlayground.js';
export * from './components/PaletteManager.js';
export * from './components/DashboardApp.js';

