/**
 * Essential Addons for Elementor Official Adapter
 */

import { ElementorNode } from '@craftor/shared-types';
import { AddonManifest } from '../types.js';

export const ESSENTIAL_ADDONS_MANIFEST: AddonManifest = {
  addonSlug: 'essential-addons-for-elementor-lite',
  name: 'Essential Addons for Elementor',
  author: 'WPDeveloper',
  version: '5.9.0',
  widgets: [
    {
      addonSlug: 'essential-addons-for-elementor-lite',
      widgetName: 'eael-post-grid',
      title: 'EA Post Grid',
      category: 'essential-addons-elementor',
      controls: [
        { name: 'post_type', label: 'Source Post Type', type: 'select', default: 'post' },
        { name: 'posts_per_page', label: 'Posts Per Page', type: 'number', default: 4 },
        { name: 'eael_show_read_more_button', label: 'Show Read More', type: 'switcher', default: 'yes' },
      ],
      astBuilder: (settings: Record<string, unknown>): ElementorNode => {
        return {
          id: `ea_grid_${Math.random().toString(36).substring(2, 9)}`,
          elType: 'widget',
          widgetType: 'eael-post-grid',
          settings: {
            post_type: settings.post_type || 'post',
            posts_per_page: settings.posts_per_page || 4,
            eael_show_read_more_button: settings.eael_show_read_more_button || 'yes',
            ...settings,
          },
          elements: [],
        };
      },
    },
  ],
};
