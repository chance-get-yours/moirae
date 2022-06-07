import { Injectable } from "@nestjs/common";
import { BaseCache } from "../classes/base.cache";
import { ICache } from "../interfaces/cache.interface";

@Injectable()
export class MemoryCache extends BaseCache implements ICache {
  private _keyValue: Map<string, string>;
  private _sets: Map<string, Set<string>>;

  constructor() {
    super();
    this._keyValue = new Map();
    this._sets = new Map();
  }

  public dropKey(key: string): Promise<void> {
    this._keyValue.delete(key);
    return Promise.resolve();
  }

  public dropSet(key: string): Promise<void> {
    this._sets.delete(key);
    return Promise.resolve();
  }

  protected handleAddToSet(key: string, value: string): Promise<boolean> {
    if (!this._sets.has(key)) this._sets.set(key, new Set());
    const returnValue = !this._sets.get(key).has(value);
    this._sets.get(key).add(value);
    return Promise.resolve(returnValue);
  }

  protected handleGetKey(key: string): Promise<string> {
    return Promise.resolve(this._keyValue.get(key));
  }

  protected handleReadFromSet(key: string): Promise<string[]> {
    return Promise.resolve([...(this._sets.get(key) || [])]);
  }

  protected handleRemoveFromSet(key: string, value: string): Promise<boolean> {
    if (!this._sets.has(key)) return Promise.resolve(false);
    const returnValue = this._sets.get(key).has(value);
    this._sets.get(key).delete(value);
    return Promise.resolve(returnValue);
  }

  protected handleSetKey(key: string, value: string): Promise<boolean> {
    this._keyValue.set(key, value);
    return Promise.resolve(true);
  }
}
