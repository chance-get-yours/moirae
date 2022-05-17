import { randomUUID } from "crypto";
import { EventEmitter } from "events";

const DISTRIBUTION_KEY = "__dist-key__";

/**
 * Provides a distribution method to publish payloads to multiple subscribers
 */
export class Distributor<TPayload> {
  private readonly _ee: EventEmitter;
  private readonly _subscriptions: Map<string, (event: TPayload) => void>;

  constructor(eventEmitter: EventEmitter, private readonly _uuid: string) {
    this._ee = eventEmitter;
    this._subscriptions = new Map();
  }

  protected get _key(): string {
    return `${this._uuid}:${DISTRIBUTION_KEY}`;
  }

  public get listenerCount(): number {
    return this._subscriptions.size;
  }

  /**
   * Clear all existing subscriptions
   */
  public clear(): void {
    this._subscriptions.clear();
  }

  /**
   * Listen to the distributor and receive all payloads asynchronously
   */
  public listen(handlerFn: (event: TPayload) => void): string {
    const _key = randomUUID();
    this._ee.addListener(this._key, handlerFn);
    this._subscriptions.set(_key, handlerFn);
    return _key;
  }

  /**
   * Publish a payload to the distributor
   */
  public async publish(event: TPayload): Promise<void> {
    this._ee.emit(this._key, event);
  }

  /**
   * Unsubscribe to all future payloads
   */
  public unsubscribe(key: string): void {
    const handler = this._subscriptions.get(key);
    if (!handler) return;
    this._ee.removeListener(this._key, handler);
    this._subscriptions.delete(key);
  }
}
