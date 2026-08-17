/**
 * Craftor SEO & Social Graph Automation Engine
 * Supports RankMath, Yoast SEO, and SEOPress meta fields and canonical link generation.
 */

export interface SeoMetadataPayload {
  postId: number;
  metaTitle: string;
  metaDescription: string;
  focusKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  pluginTarget?: 'rank_math' | 'yoast' | 'seopress' | 'native';
}

export class SeoBridge {
  private seoRecords: Map<number, SeoMetadataPayload> = new Map();

  public updateMetadata(payload: SeoMetadataPayload): {
    success: boolean;
    postId: number;
    seoScore: number;
    appliedFields: Record<string, string>;
  } {
    this.seoRecords.set(payload.postId, payload);

    // Calculate dynamic SEO readiness score
    let score = 50;
    if (payload.metaTitle && payload.metaTitle.length >= 30 && payload.metaTitle.length <= 60) score += 20;
    if (payload.metaDescription && payload.metaDescription.length >= 80 && payload.metaDescription.length <= 160) score += 15;
    if (payload.focusKeywords && payload.focusKeywords.length > 0) score += 15;

    const prefix = payload.pluginTarget === 'yoast' ? '_yoast_wpseo_' : payload.pluginTarget === 'seopress' ? '_seopress_' : 'rank_math_';

    const appliedFields: Record<string, string> = {
      [`${prefix}title`]: payload.metaTitle,
      [`${prefix}description`]: payload.metaDescription,
      [`${prefix}focus_keyword`]: (payload.focusKeywords || []).join(', '),
      [`${prefix}robots`]: payload.noindex ? 'noindex, follow' : 'index, follow',
    };


    return {
      success: true,
      postId: payload.postId,
      seoScore: Math.min(100, score),
      appliedFields,
    };
  }

  public getMetadata(postId: number): SeoMetadataPayload | undefined {
    return this.seoRecords.get(postId);
  }
}
