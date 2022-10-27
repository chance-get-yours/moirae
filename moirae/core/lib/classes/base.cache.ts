import { ICacheOptions } from "../interfaces/cache.interface";

export abstract class BaseCache {
  public addToSet<T>(key: string, value: T): Promise<boolean> {
    return this.handleAddToSet(key, JSON.stringify(value));
  }

  public async getKey<T>(
    key: string,
    options: ICacheOptions<T> = {},
  ): Promise<T> {
    const raw = await this.handleGetKey(key);
    if (!raw) return undefined;
    const value = JSON.parse(raw);
    return options.transform?.(value) || value;
  }

  protected abstract handleAddToSet(
    key: string,
    value: string,
  ): Promise<boolean>;
  protected abstract handleGetKey(key: string): Promise<string>;
  protected abstract handleReadFromSet(key: string): Promise<string[]>;
  protected abstract handleRemoveFromSet(
    key: string,
    value: string,
  ): Promise<boolean>;
  protected abstract handleSetKey(key: string, value: string): Promise<boolean>;

  public async readFromSet<T>(
    key: string,
    options: ICacheOptions<T> = {},
  ): Promise<T[]> {
    const rawList = await this.handleReadFromSet(key);
    return rawList.map((raw) => {
      const parsed = JSON.parse(raw);
      return options.transform?.(parsed) || parsed;
    });
  }

  public removeFromSet<T>(key: string, value: T): Promise<boolean> {
    return this.handleRemoveFromSet(key, JSON.stringify(value));
  }

  public async setKey<T>(key: string, value: T): Promise<boolean> {
    this.handleSetKey(key, JSON.stringify(value));
    return true;
  }
}
