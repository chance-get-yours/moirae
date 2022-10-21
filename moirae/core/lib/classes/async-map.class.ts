import { AsyncMapTimeoutError } from "../exceptions/async-map-timeout.error";
import { Distributor } from "./distributor.class";

const ASYNC_MAP = "__async_map__";

export class AsyncMap<T = unknown> {
  private readonly _distributer: Distributor<{ key: string; value: T }>;
  private readonly _map: Map<string, T>;

  constructor(distributor: Distributor<{ key: string; value: T }>) {
    this._distributer = distributor;
    this._map = new Map();
  }

  public get size(): number {
    return this._map.size;
  }

  /**
   * Remove the specified key from the map
   */
  public delete(key: string) {
    this._map.delete(key);
  }

  /**
   * Get a key from the map. Will return undefined if not found.
   *
   * @param key Key to find
   * @param defaultValue Value to use if key is not found
   */
  public get(key: string, defaultValue?: T): T | undefined {
    return this._map.get(key) || defaultValue;
  }

  /**
   * Check if key is existing in the map
   */
  public has(key: string): boolean {
    return this._map.has(key);
  }

  /**
   * Set the value of a key in the map
   */
  public set(key: string, value: T): void {
    this._map.set(key, value);
    // this._ee.emit(this._key(key), value);
    this._distributer.publish({ key, value });
  }

  public subscribe(
    handlerFn: (event: { key: string; value: T }) => void,
  ): string {
    return this._distributer.subscribe(handlerFn);
  }

  public unsubscribe(id: string): void {
    return this._distributer.unsubscribe(id);
  }

  /**
   * Asynchronously wait for a key to be inserted into the map. Will
   * persist the key in the map in addition to returning it.
   *
   * @param key Key to wait for
   * @param timeout Timeout before error is thrown in ms
   */
  public async waitGet(key: string, timeout = 5000): Promise<T> {
    if (this.has(key)) return this.get(key);
    const value = await new Promise<T>((res, rej) => {
      let _subId: string; /* eslint-disable-line prefer-const */
      const _timeout = setTimeout(() => {
        if (_subId) this._distributer.unsubscribe(_subId);
        rej(new AsyncMapTimeoutError(`Timeout waiting for key: ${key}`));
      }, timeout);
      _subId = this._distributer.subscribe((event) => {
        if (event.key === key) {
          clearTimeout(_timeout);
          if (_subId) this._distributer.unsubscribe(_subId);
          res(event.value);
        }
      });
    });
    this.set(key, value);
    return value;
  }
}
