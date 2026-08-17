/**
 * Craftor Geo-Distributed Edge KV Cache Engine
 */

export class EdgeCacheEngine {
  private cache: Map<string, { value: unknown; expiresAt: number }> = new Map();

  public set(key: string, value: unknown, ttlSeconds = 60): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  public get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  public purge(prefix?: string): number {
    if (!prefix) {
      const size = this.cache.size;
      this.cache.clear();
      return size;
    }
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }
}
