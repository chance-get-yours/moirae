import { AggregateRoot } from "../classes/aggregate-root.class";
import { RegisterType } from "../decorators/register-type.decorator";

@RegisterType()
export class UnavailableCommitError extends Error {
  constructor(aggregate: AggregateRoot<unknown>) {
    super(`Commit function is not set for ${aggregate.constructor.name}`);
    this.name = this.constructor.name;
  }
}
