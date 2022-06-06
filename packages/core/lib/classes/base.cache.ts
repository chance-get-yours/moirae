import { ICacheOptions } from "../interfaces/cache.interface";

export abstract class BaseCache {
  public async getKey<T>(
    key: string,
    options: ICacheOptions<T> = {},
  ): Promise<T> {
    const raw = await this.handleGetKey(key);
    if (!raw) return undefined;
    const value = JSON.parse(raw);
    return options.transform?.(value) || value;
  }

  protected abstract handleGetKey(key: string): Promise<string>;
  protected abstract handleSetKey(key: string, value: string): Promise<boolean>;

  public async setKey<T>(key: string, value: T): Promise<boolean> {
    this.handleSetKey(key, JSON.stringify(value));
    return true;
  }
}
