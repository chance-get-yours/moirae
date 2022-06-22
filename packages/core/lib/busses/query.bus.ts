import { Inject, Injectable } from "@nestjs/common";
import { BaseBus } from "../classes/base.bus";
import { Explorer } from "../classes/explorer.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IPublisher } from "../interfaces/publisher.interface";
import { IQuery } from "../interfaces/query.interface";
import { PUBLISHER, QUERY_METADATA } from "../moirae.constants";

/**
 * Provide the ability to run queries either locally or on remote systems
 * given the correct publisher.
 */
@Injectable()
export class QueryBus extends BaseBus<IQuery> {
  constructor(
    explorer: Explorer,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER) publisher: IPublisher,
  ) {
    super(explorer, QUERY_METADATA, observableFactory, publisher);
    this._publisher.role = "__query-bus__";
  }
}
