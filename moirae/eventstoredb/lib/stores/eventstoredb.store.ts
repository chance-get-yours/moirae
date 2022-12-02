import { Injectable, Logger } from "@nestjs/common";
import { EventProcessor, IEvent, IEventSource } from "@moirae/core";
import { EventStoreDBConnection } from "../providers/eventstoredb.connection";
import { jsonEvent, StreamNotFoundError } from "@eventstore/db-client";

@Injectable()
export class EventStoreDbStore
  extends EventProcessor<IEvent>
  implements IEventSource
{
  constructor(private readonly connection: EventStoreDBConnection) {
    super();
  }

  private streamNameFromId(streamId: string): string {
    return `moirae_events.${streamId}`;
  }

  private toEventStoreEvent(initial: IEvent) {
    return jsonEvent({
      data: this.serializeEvent(initial),
      id: initial.$uuid,
      metadata: initial.$metadata,
      type: initial.$name,
    });
  }

  public async appendToStream(
    eventList: IEvent<unknown>[],
  ): Promise<IEvent<unknown>[]> {
    const eventsByStreamId: Record<IEvent["$streamId"], IEvent[]> =
      eventList.reduce((acc, cur) => {
        if (!acc[cur.$streamId]) acc[cur.$streamId] = [];
        return {
          ...acc,
          [cur.$streamId]: acc[cur.$streamId].concat(cur),
        };
      }, {});

    for await (const [streamId, events] of Object.entries(eventsByStreamId)) {
      await this.connection.connection.appendToStream(
        this.streamNameFromId(streamId),
        events.map((evt) => this.toEventStoreEvent(evt)),
      );
    }
    return eventList;
  }

  public async readFromStream(streamId: string): Promise<IEvent<unknown>[]> {
    const raw = this.connection.connection.readStream(
      this.streamNameFromId(streamId),
    );
    const output = new Array<IEvent>();

    try {
      for await (const { event } of raw) {
        output.push(this.parseEvent(event.data as string));
      }
    } catch (err) {
      if (!(err instanceof StreamNotFoundError)) {
        Logger.error(err);
      }
    }
    return output;
  }

  listen(handlerFn: (event: IEvent<unknown>) => void): string {
    // throw new Error('Method not implemented.');
    return;
  }
  subscribe(handlerFn: (event: IEvent<unknown>) => void): string {
    // throw new Error('Method not implemented.');
    return;
  }
  unsubscribe(key: string): void {
    // throw new Error('Method not implemented.');
    return;
  }
}
