/**
 * Craftor Visual Diff Viewer Component & View Engine
 * Renders split-screen and side-by-side AST visual diff comparisons with highlight markers.
 */

import { CRAFTOR_TOKENS } from '../../design-tokens/dist/index.js';

export interface DiffViewerProps {
  beforeTitle?: string;
  afterTitle?: string;
  splitRatio?: number; // 0 to 100
  highlightAdded?: boolean;
  highlightRemoved?: boolean;
  highlightModified?: boolean;
  onAcceptChanges?: () => void;
  onRejectChanges?: () => void;
}

export interface DiffSummaryStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  percentageChanged: string;
}

export interface RenderedDiffNode {
  id: string;
  type: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  propertyChanges?: Array<{ key: string; oldValue: unknown; newValue: unknown }>;
  children?: RenderedDiffNode[];
}

export class VisualDiffViewer {
  private splitRatio: number;
  private readonly beforeTitle: string;
  private readonly afterTitle: string;

  constructor(props: DiffViewerProps = {}) {
    this.splitRatio = props.splitRatio ?? 50;
    this.beforeTitle = props.beforeTitle ?? 'Before (Original Snapshot)';
    this.afterTitle = props.afterTitle ?? 'After (AI Proposed Layout)';
  }

  public setSplitRatio(ratio: number): void {
    this.splitRatio = Math.max(0, Math.min(100, ratio));
  }

  public getSplitRatio(): number {
    return this.splitRatio;
  }

  /**
   * Generates summary metrics badge data.
   */
  public generateSummaryStats(stats: DiffSummaryStats): Record<string, unknown> {
    const total = stats.added + stats.removed + stats.modified + stats.unchanged;
    const changed = stats.added + stats.removed + stats.modified;
    const percentage = total > 0 ? ((changed / total) * 100).toFixed(1) + '%' : '0%';

    return {
      totalNodes: total,
      changedNodes: changed,
      percentage,
      badges: [
        { label: `+${stats.added} Added`, color: CRAFTOR_TOKENS.colors.dark.diffAdded, status: 'added' },
        { label: `-${stats.removed} Removed`, color: CRAFTOR_TOKENS.colors.dark.diffDeleted, status: 'removed' },
        { label: `~${stats.modified} Modified`, color: CRAFTOR_TOKENS.colors.dark.diffModified, status: 'modified' },
        { label: `${stats.unchanged} Unchanged`, color: CRAFTOR_TOKENS.colors.dark.textSecondary, status: 'unchanged' },
      ],
    };
  }

  /**
   * Generates a high-fidelity standalone SVG visual diff comparison overlay.
   */
  public renderSvgComparison(_beforeHtml: string, _afterHtml: string, width = 1200, height = 800): string {
    const splitX = (width * this.splitRatio) / 100;
    const { dark } = CRAFTOR_TOKENS.colors;

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background: ${dark.bgCanvas}; font-family: Inter, sans-serif;">
  <defs>
    <clipPath id="craftor-clip-before">
      <rect x="0" y="0" width="${splitX}" height="${height}" />
    </clipPath>
    <clipPath id="craftor-clip-after">
      <rect x="${splitX}" y="0" width="${width - splitX}" height="${height}" />
    </clipPath>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Left Side: Original -->
  <g clip-path="url(#craftor-clip-before)">
    <rect x="0" y="0" width="${width}" height="${height}" fill="${dark.bgSurface}" />
    <text x="24" y="36" fill="${dark.textSecondary}" font-size="14" font-weight="600">${this.beforeTitle}</text>
  </g>

  <!-- Right Side: AI Generated -->
  <g clip-path="url(#craftor-clip-after)">
    <rect x="0" y="0" width="${width}" height="${height}" fill="${dark.bgSurface}" />
    <text x="${width - 24}" y="36" fill="${dark.primary}" font-size="14" font-weight="600" text-anchor="end">${this.afterTitle}</text>
  </g>

  <!-- Split Divider Handle -->
  <line x1="${splitX}" y1="0" x2="${splitX}" y2="${height}" stroke="${dark.primary}" stroke-width="2" stroke-dasharray="4 2" />
  <circle cx="${splitX}" cy="${height / 2}" r="18" fill="${dark.primary}" filter="url(#shadow)" />
  <path d="M ${splitX - 6} ${height / 2} L ${splitX - 2} ${height / 2 - 4} L ${splitX - 2} ${height / 2 + 4} Z" fill="#ffffff" />
  <path d="M ${splitX + 6} ${height / 2} L ${splitX + 2} ${height / 2 - 4} L ${splitX + 2} ${height / 2 + 4} Z" fill="#ffffff" />
</svg>
    `.trim();
  }
}
