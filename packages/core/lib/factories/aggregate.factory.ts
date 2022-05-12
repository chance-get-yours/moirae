import { Inject, Injectable } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { AggregateRoot } from "../classes/aggregate-root.class";
import { IEventSource } from "../interfaces/event-source.interface";
import { IEvent } from "../interfaces/event.interface";
import { EVENT_SOURCE } from "../moirae.constants";

@Injectable()
export class AggregateFactory {
  constructor(
    @Inject(EVENT_SOURCE) private readonly eventSource: IEventSource,
  ) {}

  public async commitEvents(events: IEvent[]): Promise<IEvent[]> {
    return this.eventSource.appendToStream(events);
  }

  /**
   * Initialize a new instance of an aggregate based on the aggregate type
   * and streamId. Will read the event store for all events matching the parameters
   * and apply them to the aggregate in order.
   *
   * @param streamId
   * @param Aggregate Constructor for the aggregate
   */
  public async mergeContext<TAgg extends AggregateRoot<unknown>>(
    streamId: IEvent["streamId"],
    Aggregate: ClassConstructor<TAgg>,
  ): Promise<TAgg> {
    const events = await this.eventSource.readFromStream(streamId);
    const aggregate = new Aggregate(streamId);
    events.forEach((event) => aggregate.apply(event, true));
    aggregate.setCommitFunction(this.commitEvents.bind(this));
    return aggregate;
  }
}
