/**
 * Craftor Visual Diff & Pixel Comparison Engine
 * Computes exact pixel mismatches, similarity percentage, and bounding boxes using pixelmatch and pngjs.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { logger } from '@craftor/shared-utils';
import { DiffOutput, DiffRegion } from './types.js';

export interface VisualDiffOptions {
  baselineImagePath: string;
  currentImagePath: string;
  diffOutputPath?: string;
  threshold?: number; // Matching threshold (0 to 1); default 0.1
}

export class VisualDiffEngine {
  /**
   * Compares two PNG images pixel-by-pixel.
   * Returns similarity percentage, count of mismatched pixels, and changed bounding boxes.
   */
  public static async compare(options: VisualDiffOptions): Promise<DiffOutput> {
    if (!fs.existsSync(options.baselineImagePath)) {
      throw new Error(`Baseline image not found: ${options.baselineImagePath}`);
    }
    if (!fs.existsSync(options.currentImagePath)) {
      throw new Error(`Current image not found: ${options.currentImagePath}`);
    }

    const baselineBuffer = fs.readFileSync(options.baselineImagePath);
    const currentBuffer = fs.readFileSync(options.currentImagePath);

    const img1 = PNG.sync.read(baselineBuffer);
    const img2 = PNG.sync.read(currentBuffer);

    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);

    const diff = new PNG({ width, height });
    const threshold = options.threshold !== undefined ? options.threshold : 0.1;

    // Run pixelmatch
    const changedPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold, includeAA: false },
    );

    const totalPixels = width * height;
    const diffPercentage = totalPixels > 0 ? parseFloat(((changedPixels / totalPixels) * 100).toFixed(2)) : 0;
    const similarity = parseFloat((100 - diffPercentage).toFixed(2));

    // Detect changed bounding box regions
    const regions = this.detectChangedRegions(diff, width, height);

    // Save diff heatmap image if requested or default path
    let diffImagePath = options.diffOutputPath;
    if (!diffImagePath) {
      const dir = path.dirname(options.currentImagePath);
      const baseName = path.basename(options.currentImagePath, '.png');
      diffImagePath = path.join(dir, `${baseName}_diff.png`);
    }

    const diffBuffer = PNG.sync.write(diff);
    fs.writeFileSync(diffImagePath, diffBuffer);

    logger.info(`[VisualDiffEngine] Diff completed: ${changedPixels} changed pixels (${diffPercentage}% difference, ${similarity}% similarity, ${regions.length} regions)`);

    return {
      similarity,
      changedPixels,
      diffPercentage,
      regions,
      diffImagePath,
    };
  }

  /**
   * Scans diff image buffer for contiguous blocks of changed pixels to produce bounding boxes.
   */
  private static detectChangedRegions(diff: PNG, width: number, height: number): DiffRegion[] {
    const gridSize = 40;
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    const grid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

    // Mark grid cells containing changed pixels (pixelmatch paints diff pixels red: R=255, G=0, B=0 or similar)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const r = diff.data[idx];
        const g = diff.data[idx + 1];
        const b = diff.data[idx + 2];
        const a = diff.data[idx + 3];

        // If non-transparent and colored
        if (a && a > 0 && (r || g || b)) {
          const col = Math.floor(x / gridSize);
          const row = Math.floor(y / gridSize);
          if (row < rows && col < cols && grid[row]) {
            grid[row][col] = true;
          }
        }
      }
    }

    const regions: DiffRegion[] = [];
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

    // Flood fill connected cells into bounding boxes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r]?.[c] && !visited[r]?.[c]) {
          let minCol = c;
          let maxCol = c;
          let minRow = r;
          let maxRow = r;

          const queue: Array<[number, number]> = [[r, c]];
          const rowVisited = visited[r];
          if (rowVisited) rowVisited[c] = true;

          while (queue.length > 0) {
            const curr = queue.pop();
            if (!curr) continue;
            const [curR, curC] = curr;

            minCol = Math.min(minCol, curC);
            maxCol = Math.max(maxCol, curC);
            minRow = Math.min(minRow, curR);
            maxRow = Math.max(maxRow, curR);

            const neighbors: Array<[number, number]> = [
              [curR - 1, curC],
              [curR + 1, curC],
              [curR, curC - 1],
              [curR, curC + 1],
            ];

            for (const [nR, nC] of neighbors) {
              if (nR >= 0 && nR < rows && nC >= 0 && nC < cols && grid[nR]?.[nC] && !visited[nR]?.[nC]) {
                if (visited[nR]) visited[nR][nC] = true;
                queue.push([nR, nC]);
              }
            }
          }

          const boxX = minCol * gridSize;
          const boxY = minRow * gridSize;
          const boxW = Math.min(width - boxX, (maxCol - minCol + 1) * gridSize);
          const boxH = Math.min(height - boxY, (maxRow - minRow + 1) * gridSize);

          regions.push({
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
          });
        }
      }
    }

    return regions;
  }
}

// Export convenient shorthand function
export async function compare(options: VisualDiffOptions): Promise<DiffOutput> {
  return VisualDiffEngine.compare(options);
}
