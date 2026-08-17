/**
 * Craftor Elementor Editor Live-Sync Client Script
 * Real-time WebSocket / SSE Bridge connecting external AI IDEs directly into Elementor Canvas.
 *
 * @package CraftorCore
 * @version 1.0.0
 */

(function (window, document) {
  'use strict';

  if (!window.elementor || !window.$e) {
    // Wait for Elementor core frontend / editor initialization
    window.addEventListener('elementor/init', initCraftorLiveSync);
  } else {
    initCraftorLiveSync();
  }

  function initCraftorLiveSync() {
    console.log('[Craftor LiveSync] Initializing Elementor Canvas Real-Time Bridge...');

    var CraftorSync = {
      version: '1.0.0',
      status: 'CONNECTED',
      channel: 'craftor_editor_sync',
      lastEventId: null,

      initUI: function () {
        var topBar = document.querySelector('#elementor-panel-header-wrapper') || document.body;
        var badge = document.createElement('div');
        badge.id = 'craftor-live-sync-indicator';
        badge.innerHTML = '<span class="craftor-pulse-dot"></span> Craftor AI Connected';
        topBar.appendChild(badge);
      },

      showToast: function (title, message) {
        var toast = document.createElement('div');
        toast.className = 'craftor-sync-toast';
        toast.innerHTML = '<strong>' + title + '</strong><p>' + message + '</p>';
        document.body.appendChild(toast);
        setTimeout(function () {
          toast.classList.add('craftor-toast-fade');
          setTimeout(function () { toast.remove(); }, 400);
        }, 3500);
      },

      handleEvent: function (event) {
        if (!event || !event.action) return;
        this.lastEventId = event.eventId;
        console.log('[Craftor LiveSync] Received remote action:', event.action, event);

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
            console.log('[Craftor LiveSync] Unhandled event action:', event.action);
        }
      },

      connectSSE: function () {
        var self = this;
        var sseUrl = (window.craftorLiveSyncData && window.craftorLiveSyncData.sseEndpoint) || '/wp-json/craftor/v1/editor/events';
        try {
          var evtSource = new EventSource(sseUrl);
          evtSource.onmessage = function (e) {
            try {
              var data = JSON.parse(e.data);
              self.handleEvent(data);
            } catch (parseErr) {
              console.error('[Craftor LiveSync] JSON parse error:', parseErr);
            }
          };
          evtSource.onerror = function () {
            console.warn('[Craftor LiveSync] SSE connection interrupted, will auto-reconnect.');
          };
        } catch (err) {
          console.warn('[Craftor LiveSync] SSE not available on this server:', err);
        }
      }
    };

    CraftorSync.initUI();
    CraftorSync.connectSSE();
    window.CraftorLiveSync = CraftorSync;
  }
})(window, document);
