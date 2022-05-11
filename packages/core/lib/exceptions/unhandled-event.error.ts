import { AggregateRoot } from "../classes/aggregate-root.class";
import { RegisterType } from "../decorators/register-type.decorator";
import { IEvent } from "../interfaces/event.interface";

@RegisterType()
export class UnhandledEventError extends Error {
  constructor(aggregate: AggregateRoot<unknown>, event: IEvent) {
    super(
      `Aggregate ${aggregate.constructor.name} cannot handle event: ${event.name}`,
    );
    this.name = this.constructor.name;
  }
}
