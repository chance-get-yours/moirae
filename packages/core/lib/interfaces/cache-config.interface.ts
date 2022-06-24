type CacheType = "memory" | "redis" | "typeorm";

export interface ICacheConfig {
  /**
   * Remove all existing entries in the cache
   */
  clear?: boolean;
  type: CacheType;
}
