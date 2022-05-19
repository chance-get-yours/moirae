import { Inject, Injectable, Scope } from "@nestjs/common";
import { BasePublisher } from "../classes/base.publisher";
import { Queue } from "../classes/queue.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventLike } from "../interfaces/event-like.interface";
import { IPublisherConfig } from "../interfaces/publisher-config.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { ESState, PUBLISHER_OPTIONS } from "../moirae.constants";

@Injectable({ scope: Scope.TRANSIENT })
export class MemoryPublisher<Evt extends IEventLike>
  extends BasePublisher<Evt>
  implements IPublisher
{
  private _queue: Queue<string>;

  constructor(
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER_OPTIONS) publisherOptions: IPublisherConfig,
  ) {
    super(observableFactory, publisherOptions);
  }

  private advanceBus(): void {
    if (
      this._distributor.listenerCount === 0 ||
      this._status.current !== ESState.IDLE
    )
      return;
    const item = this._queue.dequeue();
    if (!item) return;
    this._status.set(ESState.ACTIVE);
    const parsedEvent = this.parseEvent(item);
    this._distributor.publish(parsedEvent);
  }

  protected async handleAcknowledge(event: Evt): Promise<void> {
    this.advanceBus();
  }

  protected async handleBootstrap(): Promise<void> {
    this._queue = new Queue<string>();
  }

  protected async handlePublish(eventString: string): Promise<void> {
    this._queue.enqueue(eventString);
    if (this._queue.size === 1) this.advanceBus();
  }

  protected async handleResponse(
    routingKey: string,
    responseJSON: string,
  ): Promise<void> {
    const res = this.parseResponse(responseJSON);
    this._responseMap.set(res.responseKey, res);
  }

  protected async handleShutdown(): Promise<void> {
    this._distributor.clear();
  }
}
