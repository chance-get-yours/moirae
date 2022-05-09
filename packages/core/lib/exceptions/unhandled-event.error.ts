import { AggregateRoot } from "../classes/aggregate-root.class";
import { IEvent } from "../interfaces/event.interface";

export class UnhandledEventError extends Error {
  constructor(aggregate: AggregateRoot, event: IEvent) {
    super(
      `Aggregate ${aggregate.constructor.name} cannot handle event: ${event.name}`,
    );
    this.name = this.constructor.name;
  }
}
