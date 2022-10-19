import {
  EventProcessor,
  EVENT_PUBLISHER,
  IEvent,
  IEventSource,
  IPublisher,
} from "@moirae/core";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { instanceToPlain } from "class-transformer";
import { Repository } from "typeorm";
import { EventStore } from "../entities/event-store.entity";

@Injectable()
export class TypeORMStore
  extends EventProcessor<IEvent>
  implements IEventSource
{
  constructor(
    @Inject(EVENT_PUBLISHER) private readonly publisher: IPublisher<IEvent>,
    @InjectRepository(EventStore)
    private readonly repository: Repository<EventStore>,
  ) {
    super();
    this.publisher.role = EVENT_PUBLISHER;
  }

  public async appendToStream(
    eventList: IEvent<unknown>[],
  ): Promise<IEvent<unknown>[]> {
    const events = await this.repository.save(
      eventList.map((event) => instanceToPlain(event)),
    );
    for await (const event of eventList) {
      await this.publisher.publish(event);
    }
    return events.map((event) => this.plainToInstance(event));
  }

  public async readFromStream($streamId: string): Promise<IEvent<unknown>[]> {
    return (
      await this.repository.find({
        where: { $streamId },
        order: { $order: "ASC" },
      })
    ).map((event) => this.plainToInstance(event));
  }

  listen(handlerFn: (event: IEvent<unknown>) => void): string {
    return this.publisher.listen(handlerFn);
  }

  subscribe(handlerFn: (event: IEvent<unknown>) => void): string {
    return this.publisher.subscribe(handlerFn);
  }

  unsubscribe(key: string): void {
    return this.publisher.unsubscribe(key);
  }
}
