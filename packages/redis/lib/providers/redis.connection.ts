import { CACHE_OPTIONS } from "@moirae/core";
import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
  Scope,
} from "@nestjs/common";
import {
  createClient,
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "@redis/client";
import { IRedisCacheConfig } from "../interfaces/redis-cache.interface";

@Injectable({ scope: Scope.TRANSIENT })
export class RedisConnection implements OnModuleInit, OnApplicationShutdown {
  private _connection: RedisClientType<
    RedisModules,
    RedisFunctions,
    RedisScripts
  >;

  constructor(
    @Inject(CACHE_OPTIONS) private readonly options: IRedisCacheConfig,
  ) {}

  public get connection(): RedisClientType<
    RedisModules,
    RedisFunctions,
    RedisScripts
  > {
    return this._connection;
  }

  public async onApplicationShutdown() {
    if (this._connection.isOpen) await this._connection.quit();
  }

  public async onModuleInit() {
    this._connection = createClient(this.options.redis);
    await this._connection.connect();
    if (this.options.clear) await this._connection.flushDb();
  }
}
