import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { Explorer } from "../classes/explorer.class";
import { ObservableFactory } from "../factories/observable.factory";
import { ExecuteOptions } from "../interfaces/execute-options.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { IQuery } from "../interfaces/query.interface";
import {
  PublisherRole,
  QUERY_METADATA,
  QUERY_PUBLISHER,
} from "../moirae.constants";

/**
 * Provide the ability to run queries either locally or on remote systems
 * given the correct publisher.
 */
@Injectable()
export class QueryBus extends BaseBus<IQuery> {
  constructor(
    explorer: Explorer,
    observableFactory: ObservableFactory,
    @Inject(QUERY_PUBLISHER) publisher: IPublisher,
  ) {
    super(explorer, QUERY_METADATA, observableFactory, publisher);
    this._publisher.role = PublisherRole.QUERY_BUS;
  }

  /**
   * Execute the provided query on a remote system
   */
  public async execute<TRes>(
    query: IQuery,
    options: ExecuteOptions = {},
  ): Promise<TRes> {
    const { throwError = false } = options;
    const _key = randomUUID();
    query.$responseKey = _key;

    let res: TRes;

    if (!query.$executionDomain) query.$executionDomain = "default";
    if (query.$executionDomain === this._publisher.domain) {
      res = (await this.executeLocal(
        query,
        options as Record<string, unknown>,
      )) as TRes;
    } else {
      await this._publisher.publish(query);
      const external = await this._publisher.awaitResponse(_key);
      if (external.payload instanceof Error && throwError)
        throw external.payload;
      res = external.payload as TRes;
    }

    return res;
  }
}
