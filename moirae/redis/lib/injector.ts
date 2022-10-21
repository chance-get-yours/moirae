import { InjectorFunction } from "@moirae/core";
import { CACHE_PROVIDER } from "@moirae/core";
import { RedisCache } from "./caches/redis.cache";
import { RedisConnection } from "./providers/redis.connection";

export const injectRedis: InjectorFunction = () => ({
    exports: [RedisConnection],
    providers: [{
        provide: CACHE_PROVIDER,
        useClass: RedisCache
    }]
})