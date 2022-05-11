import { AggregateRoot } from "../classes/aggregate-root.class";
import { RegisterType } from "../decorators/register-type.decorator";

@RegisterType()
export class InvalidMultipleSetError extends Error {
  constructor(aggregate: AggregateRoot<unknown>, field: string) {
    super(
      `Invalid set for ${aggregate.constructor.name}.${field}: Value already exists`,
    );
    this.name = this.constructor.name;
  }
}
