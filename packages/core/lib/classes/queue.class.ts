import { randomUUID } from "crypto";

interface QueueItem<T> {
  item: T;
  key: string;
  nextKey?: string;
}

/**
 * Create a FIFO queue
 */
export class Queue<T = any> {
  private _firstKey: string;
  private _lastKey: string;
  private readonly _map: Map<string, QueueItem<T>>;

  constructor() {
    this._map = new Map();
  }

  /**
   * Empty the queue of all content
   */
  public clear(): void {
    this._map.clear();
    this._lastKey = undefined;
  }

  /**
   * Dequeue the first element or undefined if none exists
   */
  public dequeue(): T | undefined {
    if (!this._firstKey) return;
    const mapItem = this._map.get(this._firstKey);
    if (!mapItem) return;
    this._map.delete(mapItem.key);
    this._firstKey = mapItem.nextKey;
    if (this._lastKey === mapItem.key) this._lastKey = undefined;
    return mapItem.item;
  }

  /**
   * Add an item to the bottom of the queue
   */
  public enqueue(item: T): void {
    const key = randomUUID();
    if (this.size === 0) this._firstKey = key;
    if (this._lastKey) {
      const prevLast = this._map.get(this._lastKey);
      prevLast.nextKey = key;
      this._map.set(prevLast.key, prevLast);
    }
    this._map.set(key, {
      key,
      item,
    });
    this._lastKey = key;
  }

  public get size(): number {
    return this._map.size;
  }
}
