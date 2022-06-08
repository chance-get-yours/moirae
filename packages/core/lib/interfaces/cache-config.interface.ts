type CacheType = "memory" | "redis";

export interface ICacheConfig {
  /**
   * Remove all existing entries in the cache
   */
  clear?: boolean;
  type: CacheType;
}
