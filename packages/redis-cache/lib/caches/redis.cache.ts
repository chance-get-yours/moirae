import { BaseCache, CACHE_OPTIONS, ICache } from "@moirae/core";
import { Inject, Injectable } from "@nestjs/common";
import { IRedisCacheConfig } from "../interfaces/redis-cache.interface";
import { RedisConnection } from "../providers/redis.connection";

@Injectable()
export class RedisCache extends BaseCache implements ICache {
  constructor(
    private readonly connection: RedisConnection,
    @Inject(CACHE_OPTIONS) private readonly options: IRedisCacheConfig,
  ) {
    super();
  }

  private get DEFAULT_CACHE_DURATION(): number {
    return this.options.transactionCacheDuration || 172800;
  }

  public async dropKey(key: string): Promise<void> {
    await this.connection.connection.del(this._prefixKey(key));
  }

  public dropSet(key: string): Promise<void> {
    return this.dropKey(key);
  }

  private _setExpiration(
    key: string,
    duration: number = this.DEFAULT_CACHE_DURATION,
  ): Promise<boolean> {
    return this.connection.connection.expire(this._prefixKey(key), duration);
  }

  private _prefixKey(key: string): string {
    return `${this.options.namespaceRoot}__${key}`;
  }

  protected async handleAddToSet(
    key: string,
    value: string,
    duration?: number,
  ): Promise<boolean> {
    const res = await this.connection.connection.sAdd(
      this._prefixKey(key),
      value,
    );
    await this._setExpiration(key, duration);
    return Boolean(res).valueOf();
  }

  protected handleGetKey(key: string): Promise<string> {
    return this.connection.connection.get(this._prefixKey(key));
  }

  protected async handleReadFromSet(
    key: string,
    duration?: number,
  ): Promise<string[]> {
    const output = await this.connection.connection.sMembers(
      this._prefixKey(key),
    );
    await this._setExpiration(key, duration);
    return output;
  }

  protected async handleRemoveFromSet(
    key: string,
    value: string,
    duration?: number,
  ): Promise<boolean> {
    const res = await this.connection.connection.sRem(
      this._prefixKey(key),
      value,
    );
    await this._setExpiration(key, duration);
    return Boolean(res).valueOf();
  }

  protected async handleSetKey(key: string, value: string): Promise<boolean> {
    const res = await this.connection.connection.set(
      this._prefixKey(key),
      value,
    );
    return !!res;
  }
}
