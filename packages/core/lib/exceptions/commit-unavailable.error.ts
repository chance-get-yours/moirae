import { AggregateRoot } from "../classes/aggregate-root.class";

export class UnavailableCommitError extends Error {
  constructor(aggregate: AggregateRoot) {
    super(`Commit function is not set for ${aggregate.constructor.name}`);
    this.name = this.constructor.name;
  }
}
