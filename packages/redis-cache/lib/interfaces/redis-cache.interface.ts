import { ICacheConfig } from "@moirae/core";
import { RedisClientOptions } from "@redis/client";

export interface IRedisCacheConfig extends ICacheConfig {
  /**
   * Connection parameters for the underlying `redis` library
   */
  redis: RedisClientOptions;
  /**
   * Namespace root that prefixes all elements of the cache
   */
  namespaceRoot: string;
  /**
   * Duration in seconds to persist transaction information in the redis cache
   * after last interaction.
   *
   * @default 172800 (48hrs)
   */
  transactionCacheDuration?: number;
  type: "redis";
}
