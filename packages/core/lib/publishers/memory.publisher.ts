import { Injectable, Scope } from "@nestjs/common";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { BasePublisher } from "../classes/base.publisher";
import { Queue } from "../classes/queue.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventLike } from "../interfaces/event-like.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { ESState } from "../moirae.constants";

const EVENT_KEY = "__event_key__";

@Injectable({ scope: Scope.TRANSIENT })
export class MemoryPublisher<Evt extends IEventLike>
  extends BasePublisher<Evt>
  implements IPublisher
{
  private _ee: EventEmitter;
  private _queue: Queue;
  private _uuid: string;

  constructor(observableFactory: ObservableFactory) {
    super(observableFactory);
    this._uuid = randomUUID();
  }

  private get _key(): string {
    return `${this._uuid}:${EVENT_KEY}`;
  }

  private advanceBus(): void {
    if (
      this._ee.listenerCount(this._key) === 0 ||
      this._status.current !== ESState.IDLE
    )
      return;
    const item = this._queue.dequeue();
    if (!item) return;
    this._ee.emit(this._key, item);
  }

  protected async handleAcknowledge(event: Evt): Promise<void> {
    this.advanceBus();
  }

  protected async handleBootstrap(): Promise<void> {
    this._ee = this._observableFactory.emitter;
    this._queue = new Queue<string>();
  }

  protected async handleResponse(
    responseKey: string,
    responseJSON: string,
  ): Promise<void> {
    this._responseMap.set(responseKey, responseJSON);
  }

  protected async handleShutdown(): Promise<void> {
    this._ee.removeAllListeners();
  }

  protected handleSubscribe(handlerFn: (eventString: string) => void): string {
    this._ee.addListener(this._key, handlerFn);
    const key = randomUUID();
    this._subscriptions.set(key, handlerFn);
    return key;
  }

  protected handleUnsubscribe(key: string): void {
    const sub = this._subscriptions.get(key);
    if (!sub) return;
    this._ee.removeListener(this._key, sub);
  }

  public async publish(event: Evt): Promise<void> {
    const serialized = this.serializeEvent(event);
    this._queue.enqueue(serialized);
    if (this._queue.size === 1) this.advanceBus();
  }
}
