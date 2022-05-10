import { randomUUID } from "crypto";
import { EventEmitter } from "events";

const STATE_UPDATED = "__state-updated__";
type SubscriptionFunction<T> = (newState: T) => void;

export class StateTracker<T> {
  private _state: T;

  private readonly _ee: EventEmitter;
  private readonly _subscriptions: Map<string, SubscriptionFunction<T>>;
  private readonly _uuid: string;

  constructor(initialStatus: T, eventEmitter?: EventEmitter) {
    this._state = initialStatus;

    this._ee = eventEmitter || new EventEmitter();
    this._subscriptions = new Map();
    this._uuid = randomUUID();
  }

  private get _key(): string {
    return `${this._uuid}:${STATE_UPDATED}`;
  }

  /**
    Get the current state
     */
  public get current(): T {
    return this._state;
  }

  public await(desiredState: T): Promise<T> {
    return new Promise((res, rej) => {
      const timeout = setTimeout(() => {
        rej(new Error("HI"));
      }, 3000);
      const key = this.subscribe((currentState) => {
        if (currentState === desiredState) {
          this.unsubscribe(key);
          clearTimeout(timeout);
          res(currentState);
        }
      });
    });
  }

  public set(newState: T): void {
    this._state = newState;
    this._ee.emit(this._key, this._state);
  }

  /**
   * Subscribe to all updates to the state
   */
  public subscribe(handler: SubscriptionFunction<T>): string {
    this._ee.addListener(this._key, handler);
    const key = randomUUID();
    this._subscriptions.set(key, handler);
    return key;
  }

  /**
   * Unsubscribe from updates to the state
   */
  public unsubscribe(key: string): void {
    const handler = this._subscriptions.get(key);
    if (!handler) return;
    this._ee.removeListener(this._key, handler);
  }
}
