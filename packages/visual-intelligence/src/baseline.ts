/**
 * Craftor Baseline Storage & Comparison System
 * Deterministically records and retrieves baseline screenshots and structural metadata.
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@craftor/shared-utils';
import { BaselineRecord, ScreenshotResult } from './types.js';

export class BaselineManager {
  private readonly storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || path.resolve(process.cwd(), '.craftor', 'baselines');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Creates and stores a baseline record without silent overwrite.
   */
  public createBaseline(
    siteId: string,
    pageId: string | number,
    result: ScreenshotResult,
    overwrite: boolean = false,
  ): BaselineRecord {
    const key = `${siteId}_${pageId}_${result.viewport.name}`;
    const filePath = path.join(this.storageDir, `${key}.json`);

    if (fs.existsSync(filePath) && !overwrite) {
      logger.debug(`[BaselineManager] Baseline already exists for ${key}`);
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as BaselineRecord;
    }

    const record: BaselineRecord = {
      siteId,
      pageId,
      viewport: result.viewport.name,
      hash: `hash_${Date.now().toString(36)}_${result.domMetrics.rootContainers}_${result.domMetrics.totalWidgets}`,
      screenshotPath: result.screenshotPath,
      domMetrics: result.domMetrics,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');
    logger.info(`[BaselineManager] Saved baseline for ${key} (${record.hash})`);
    return record;
  }

  /**
   * Retrieves an existing baseline record.
   */
  public getBaseline(
    siteId: string,
    pageId: string | number,
    viewport: 'desktop' | 'tablet' | 'mobile',
  ): BaselineRecord | null {
    const key = `${siteId}_${pageId}_${viewport}`;
    const filePath = path.join(this.storageDir, `${key}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as BaselineRecord;
  }
}
