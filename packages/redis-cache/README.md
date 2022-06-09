# @moirae/redis-cache

A cache provider for Moirae leveraging Redis.

## Configuration
```ts
{
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
```