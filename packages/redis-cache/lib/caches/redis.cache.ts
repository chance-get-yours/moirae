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

  public async dropKey(key: string): Promise<void> {
    await this.connection.connection.del(this._prefixKey(key));
  }

  public dropSet(key: string): Promise<void> {
    return this.dropKey(key);
  }

  private _prefixKey(key: string): string {
    return `${this.options.namespaceRoot}__${key}`;
  }

  protected async handleAddToSet(key: string, value: string): Promise<boolean> {
    const res = await this.connection.connection.sAdd(
      this._prefixKey(key),
      value,
    );
    return Boolean(res).valueOf();
  }

  protected handleGetKey(key: string): Promise<string> {
    return this.connection.connection.get(this._prefixKey(key));
  }

  protected handleReadFromSet(key: string): Promise<string[]> {
    return this.connection.connection.sMembers(this._prefixKey(key));
  }

  protected async handleRemoveFromSet(
    key: string,
    value: string,
  ): Promise<boolean> {
    const res = await this.connection.connection.sRem(
      this._prefixKey(key),
      value,
    );
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
