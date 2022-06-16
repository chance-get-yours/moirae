import { AggregateRoot } from "../classes/aggregate-root.class";
import { RegisterType } from "../decorators/register-type.decorator";

@RegisterType()
export class AggregateDeletedError extends Error {
  constructor(aggregate: AggregateRoot<unknown>) {
    super(
      `Unable to apply event. Aggregate ${aggregate.constructor.name}:${aggregate.streamId} has been marked as deleted`,
    );
    this.name = this.constructor.name;
  }
}
