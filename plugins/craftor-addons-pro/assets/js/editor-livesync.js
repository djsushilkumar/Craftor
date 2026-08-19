/**
 * Craftor Addons Pro - Elementor Editor Live-Sync Client Script
 * Real-time WebSocket / SSE Bridge connecting external AI IDEs directly into Elementor Canvas.
 *
 * @package CraftorAddonsPro
 * @version 1.0.0
 */

(function (window, document) {
  'use strict';

  if (!window.elementor || !window.$e) {
    window.addEventListener('elementor/init', initCraftorLiveSync);
  } else {
    initCraftorLiveSync();
  }

  function initCraftorLiveSync() {
    console.log('[Craftor Pro LiveSync] Initializing Elementor Canvas Real-Time Bridge...');

    var CraftorSync = {
      version: '1.0.0',
      status: 'CONNECTED',
      channel: 'craftor_editor_sync',
      lastEventId: null,

      initUI: function () {
        var topBar = document.querySelector('#elementor-panel-header-wrapper') || document.body;
        var badge = document.createElement('div');
        badge.id = 'craftor-live-sync-indicator';
        badge.innerHTML = '<span class="craftor-pulse-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span> ⚡ Craftor Pro Connected';
        badge.style.cssText = 'background:#1e1b4b;color:#f59e0b;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;margin-left:10px;display:inline-flex;align-items:center;';
        topBar.appendChild(badge);
      },

      showToast: function (title, message) {
        var toast = document.createElement('div');
        toast.className = 'craftor-sync-toast';
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0f172a;color:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:999999;font-family:sans-serif;font-size:13px;';
        toast.innerHTML = '<strong style="color:#38bdf8;">' + title + '</strong><p style="margin:4px 0 0 0;color:#cbd5e1;">' + message + '</p>';
        document.body.appendChild(toast);
        setTimeout(function () {
          toast.remove();
        }, 3500);
      },

      handleEvent: function (event) {
        if (!event || !event.action) return;
        this.lastEventId = event.eventId;
        console.log('[Craftor Pro LiveSync] Received remote action:', event.action, event);

        switch (event.action) {
          case 'insert_node':
            if (window.$e && event.payload && event.payload.node) {
              this.showToast('AI Action', 'Inserting ' + (event.payload.node.widgetType || event.payload.node.elType));
              window.$e.run('document/elements/create', {
                model: event.payload.node,
                container: event.payload.parentId ? window.elementor.getContainer(event.payload.parentId) : null,
              });
            }
            break;

          case 'update_settings':
            if (window.$e && event.payload && event.payload.elementId) {
              this.showToast('AI Action', 'Updating element styles & settings');
              var container = window.elementor.getContainer(event.payload.elementId);
              if (container) {
                window.$e.run('document/elements/settings', {
                  container: container,
                  settings: event.payload.settings,
                });
              }
            }
            break;

          case 'replace_document':
            if (window.$e && event.payload && event.payload.elements) {
              this.showToast('AI Action', 'Applying full AI layout generation');
              window.$e.run('document/save/update', {
                elements: event.payload.elements,
              });
            }
            break;

          case 'reload_css':
            if (window.elementor && window.elementor.reloadPreview) {
              window.elementor.reloadPreview();
            }
            break;

          default:
            console.log('[Craftor Pro LiveSync] Unhandled event action:', event.action);
        }
      },

      connectSSE: function () {
        var self = this;
        var config = window.craftorProData || {};
        var sseUrl = config.sseUrl || '/wp-json/craftor/v1/editor/events';
        if (config.token) {
          sseUrl += (sseUrl.indexOf('?') === -1 ? '?' : '&') + 'token=' + encodeURIComponent(config.token);
        }
        try {
          var evtSource = new EventSource(sseUrl);
          evtSource.onmessage = function (e) {
            try {
              var data = JSON.parse(e.data);
              self.handleEvent(data);
            } catch (parseErr) {
              console.error('[Craftor Pro LiveSync] JSON parse error:', parseErr);
            }
          };
          evtSource.onerror = function () {
            console.warn('[Craftor Pro LiveSync] SSE reconnecting...');
          };
        } catch (err) {
          console.warn('[Craftor Pro LiveSync] SSE not available on this server:', err);
        }
      }
    };

    CraftorSync.initUI();
    CraftorSync.connectSSE();
    window.CraftorLiveSync = CraftorSync;
  }
})(window, document);
