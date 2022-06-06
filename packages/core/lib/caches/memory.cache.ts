import { Injectable } from "@nestjs/common";
import { BaseCache } from "../classes/base.cache";
import { ICache } from "../interfaces/cache.interface";

@Injectable()
export class MemoryCache extends BaseCache implements ICache {
  private _keyValue: Map<string, string>;

  constructor() {
    super();
    this._keyValue = new Map();
  }

  protected handleGetKey(key: string): Promise<string> {
    return Promise.resolve(this._keyValue.get(key));
  }

  protected handleSetKey(key: string, value: string): Promise<boolean> {
    this._keyValue.set(key, value);
    return Promise.resolve(true);
  }
}
