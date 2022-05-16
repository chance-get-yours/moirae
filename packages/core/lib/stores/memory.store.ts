import { Inject, Injectable } from "@nestjs/common";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventSource } from "../interfaces/event-source.interface";
import { IEvent } from "../interfaces/event.interface";
import { IPublisherConfig } from "../interfaces/publisher-config.interface";
import { PUBLISHER_OPTIONS } from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";

@Injectable()
export class MemoryStore
  extends MemoryPublisher<IEvent>
  implements IEventSource
{
  private _streams: Map<string, IEvent[]>;

  constructor(
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER_OPTIONS) publisherOptions: IPublisherConfig,
  ) {
    super(observableFactory, publisherOptions);
    this.role = "__event-store__";
  }

  public async appendToStream(eventList: IEvent[]): Promise<IEvent[]> {
    await Promise.allSettled(
      eventList.map((event) => {
        if (!this._streams.has(event.streamId))
          this._streams.set(event.streamId, []);
        this._streams.get(event.streamId).push(event);
        return this.publish(event);
      }),
    );
    return eventList;
  }

  public async onApplicationBootstrap() {
    this._streams = new Map();
    await super.onApplicationBootstrap();
  }

  public async readFromStream(streamId: string): Promise<IEvent[]> {
    return this._streams.get(streamId) || [];
  }
}
