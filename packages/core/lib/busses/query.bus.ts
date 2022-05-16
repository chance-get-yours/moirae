import { Inject, Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { BaseBus } from "../classes/base.bus";
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
    moduleContainer: ModulesContainer,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER) publisher: IPublisher,
  ) {
    super(QUERY_METADATA, moduleContainer, observableFactory, publisher);
    this._publisher.role = "__query-bus__";
  }
}
