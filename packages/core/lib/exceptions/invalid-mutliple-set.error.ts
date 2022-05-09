import { AggregateRoot } from "../classes/aggregate-root.class";

export class InvalidMultipleSetError extends Error {
  constructor(aggregate: AggregateRoot, field: string) {
    super(
      `Invalid set for ${aggregate.constructor.name}.${field}: Value already exists`,
    );
    this.name = this.constructor.name;
  }
}
