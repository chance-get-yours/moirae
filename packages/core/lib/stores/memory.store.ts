import { Injectable, Scope } from "@nestjs/common";
import { IEvent } from "packages/core";
import { IEventSource } from "../interfaces/event-source.interface";
import { MemoryPublisher } from "../publishers/memory.publisher";

@Injectable({ scope: Scope.TRANSIENT })
export class MemoryStore
  extends MemoryPublisher<IEvent>
  implements IEventSource
{
  private _streams: Map<string, IEvent[]>;

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

  public async onModuleInit() {
    this._streams = new Map();
    await super.onModuleInit();
  }

  public async readFromStream(streamId: string): Promise<IEvent[]> {
    return this._streams.get(streamId) || [];
  }
}
