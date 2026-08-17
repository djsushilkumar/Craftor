/**
 * Crocoblock (JetEngine) Official Addon Adapter
 */

import { ElementorNode } from '@craftor/shared-types';
import { AddonManifest } from '../types.js';

export const CROCOBLOCK_JETENGINE_MANIFEST: AddonManifest = {
  addonSlug: 'jet-engine',
  name: 'Crocoblock JetEngine',
  author: 'Crocoblock',
  version: '3.4.0',
  widgets: [
    {
      addonSlug: 'jet-engine',
      widgetName: 'jet-listing-grid',
      title: 'JetEngine Listing Grid',
      category: 'listing-elements',
      controls: [
        { name: 'lisitng_id', label: 'Listing Template', type: 'select', default: '' },
        { name: 'posts_num', label: 'Posts Number', type: 'number', default: 6 },
        { name: 'columns', label: 'Columns', type: 'select', default: '3' },
        { name: 'is_masonry', label: 'Masonry Grid', type: 'switcher', default: 'no' },
      ],
      astBuilder: (settings: Record<string, unknown>): ElementorNode => {
        return {
          id: `jet_grid_${Math.random().toString(36).substring(2, 9)}`,
          elType: 'widget',
          widgetType: 'jet-listing-grid',
          settings: {
            lisitng_id: settings.lisitng_id || 'default_template',
            posts_num: settings.posts_num || 6,
            columns: settings.columns || '3',
            is_masonry: settings.is_masonry || 'no',
            ...settings,
          },
          elements: [],
        };
      },
    },
  ],
};
