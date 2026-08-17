/**
 * Craftor Elementor Popups & Motion Effects AST Synthesizer
 * Generates modal lightboxes, exit-intent overlays, and applies advanced scroll/hover motion effects.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';

export interface PopupGeneratorConfig {
  title: string;
  triggerType: 'exit_intent' | 'page_load' | 'scroll_depth' | 'button_click';
  layout: 'centered_modal' | 'bottom_bar' | 'slide_in_right';
  headline: string;
  ctaText: string;
  closeButton?: boolean;
}

export interface MotionEffectsConfig {
  entranceAnimation?: 'fadeInUp' | 'zoomIn' | 'bounceIn' | 'slideInLeft';
  animationDuration?: 'slow' | 'normal' | 'fast';
  animationDelay?: number;
  mouseTrack?: boolean;
  tilt3D?: boolean;
  sticky?: 'top' | 'bottom';
}

export class PopupGenerator {
  /**
   * Generates a complete Elementor Popup AST document.
   */
  public generatePopup(config: PopupGeneratorConfig): {
    success: boolean;
    templateType: 'popup';
    trigger: string;
    ast: ElementorNode[];
  } {
    const popupContainer: ElementorNode = {
      id: 'popup_modal_root',
      elType: 'container',
      settings: {
        flex_direction: 'column',
        align_items: 'center',
        justify_content: 'center',
        background_background: 'classic',
        background_color: 'rgba(17, 24, 39, 0.95)',
        padding: '2.5rem',
        border_radius: '16px',
        box_shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        popup_trigger: config.triggerType,
        popup_layout: config.layout,
      },
      elements: [
        {
          id: 'popup_hdg_1',
          elType: 'widget',
          widgetType: 'heading',
          settings: { title: config.headline, align: 'center' },
          elements: [],
        },
        {
          id: 'popup_txt_1',
          elType: 'widget',
          widgetType: 'text-editor',
          settings: { editor: 'Exclusive limited-time offer. Enter your email to claim instant access.' },
          elements: [],
        },
        {
          id: 'popup_btn_1',
          elType: 'widget',
          widgetType: 'button',
          settings: { text: config.ctaText, align: 'center' },
          elements: [],
        },
      ],
    };

    return {
      success: true,
      templateType: 'popup',
      trigger: config.triggerType,
      ast: [popupContainer],
    };
  }

  /**
   * Injects motion and animation effects into target Elementor AST nodes.
   */
  public applyMotionEffects(node: ElementorNode, effects: MotionEffectsConfig): ElementorNode {
    const updatedSettings: Record<string, unknown> = {
      ...(node.settings || {}),
      _animation: effects.entranceAnimation || 'fadeInUp',
      _animation_duration: effects.animationDuration || 'normal',
      _animation_delay: effects.animationDelay || 200,
      motion_fx_mouse_track: effects.mouseTrack ? 'yes' : 'no',
      motion_fx_tilt: effects.tilt3D ? 'yes' : 'no',
    };

    if (effects.sticky) {
      updatedSettings._sticky = effects.sticky;
    }


    return {
      ...node,
      settings: updatedSettings,
    };
  }
}
