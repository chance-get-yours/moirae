import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { AsyncMapTimeoutError } from "../exceptions/async-map-timeout.error";

const ASYNC_MAP = "__async_map__";

export class AsyncMap<T = unknown> {
  private readonly _ee: EventEmitter;
  private readonly _map: Map<string, T>;
  private readonly _uuid: string;

  constructor(eventEmitter?: EventEmitter) {
    this._ee = eventEmitter || new EventEmitter();
    this._map = new Map();
    this._uuid = randomUUID();
  }

  private _key(userKey: string): string {
    return `${this._uuid}:${ASYNC_MAP}:${userKey}`;
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
    this._ee.emit(this._key(key), value);
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
    const eeKey = this._key(key);
    const value = await new Promise<T>((res, rej) => {
      const _timeout = setTimeout(() => {
        rej(new AsyncMapTimeoutError(`Timeout waiting for key: ${key}`));
      }, timeout);
      const listenerFN = (msg: T) => {
        clearTimeout(_timeout);
        this._ee.removeListener(eeKey, listenerFN);
        res(msg);
      };
      this._ee.addListener(eeKey, listenerFN);
    });
    this.set(key, value);
    return value;
  }
}
