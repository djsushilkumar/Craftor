/**
 * Craftor Elementor Editor Live Canvas Sync Bridge
 * Broadcasts AST mutations and style updates in real time to the live Elementor editor session.
 */

import { ElementorNode } from '../../shared-types/dist/index.js';
import { logger } from '../../shared-utils/dist/index.js';
import { WordPressClient } from './client.js';

export interface LiveSyncEvent {
  eventId: string;
  pageId: number;
  action: 'insert_node' | 'update_settings' | 'remove_node' | 'replace_document' | 'reload_css';
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface LiveSyncOptions {
  client?: WordPressClient;
  channel?: string;
  autoConnect?: boolean;
}

export class ElementorLiveSyncBridge {
  private readonly client?: WordPressClient;
  private readonly channel: string;
  private readonly subscribers: Array<(event: LiveSyncEvent) => void> = [];

  constructor(options?: LiveSyncOptions) {
    this.client = options?.client;
    this.channel = options?.channel ?? 'craftor_editor_sync';
  }

  public getChannel(): string {
    return this.channel;
  }

  public subscribe(callback: (event: LiveSyncEvent) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const idx = this.subscribers.indexOf(callback);
      if (idx !== -1) {
        this.subscribers.splice(idx, 1);
      }
    };
  }

  /**
   * Broadcasts a node insertion to the live Elementor canvas.
   */
  public async broadcastNodeInsertion(pageId: number, parentId: string | null, node: ElementorNode): Promise<LiveSyncEvent> {
    const event: LiveSyncEvent = {
      eventId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pageId,
      action: 'insert_node',
      payload: { parentId, node },
      timestamp: new Date().toISOString(),
    };

    return this.dispatchSyncEvent(event);
  }

  /**
   * Broadcasts settings update to a specific widget or container.
   */
  public async broadcastSettingsUpdate(pageId: number, elementId: string, settings: Record<string, unknown>): Promise<LiveSyncEvent> {
    const event: LiveSyncEvent = {
      eventId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pageId,
      action: 'update_settings',
      payload: { elementId, settings },
      timestamp: new Date().toISOString(),
    };

    return this.dispatchSyncEvent(event);
  }

  /**
   * Broadcasts full document replacement.
   */
  public async broadcastDocumentReplace(pageId: number, elements: ElementorNode[]): Promise<LiveSyncEvent> {
    const event: LiveSyncEvent = {
      eventId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pageId,
      action: 'replace_document',
      payload: { elements },
      timestamp: new Date().toISOString(),
    };

    return this.dispatchSyncEvent(event);
  }

  /**
   * Broadcasts a pre-constructed LiveSyncEvent.
   */
  public async broadcastEvent(event: LiveSyncEvent): Promise<LiveSyncEvent> {
    return this.dispatchSyncEvent(event);
  }

  /**
   * Dispatches the event to registered subscribers and active REST bridge if connected.
   */
  private async dispatchSyncEvent(event: LiveSyncEvent): Promise<LiveSyncEvent> {
    logger.info(`[LiveSyncBridge] Dispatching editor event "${event.action}" for page ${event.pageId}`, {
      eventId: event.eventId,
      action: event.action,
    });

    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        logger.error(`[LiveSyncBridge] Subscriber error on event ${event.eventId}`, { err });
      }
    }

    if (this.client?.isConnected()) {
      try {
        await this.client.getRestClient().post('/wp-json/craftor/v1/editor/sync', event);
      } catch (err) {
        logger.warn(`[LiveSyncBridge] Failed to dispatch live sync over REST beacon`, { err });
      }
    }

    return event;
  }
}
