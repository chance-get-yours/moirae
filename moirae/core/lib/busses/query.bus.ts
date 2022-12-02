import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { DomainStore } from "../classes/domain-store.class";
import { Explorer } from "../classes/explorer.class";
import { ObservableFactory } from "../factories/observable.factory";
import { ExecuteOptions } from "../interfaces/execute-options.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { IQuery } from "../interfaces/query.interface";
import { QueryBusReadyMessage } from "../messenger/messages";
import { MessengerService } from "../messenger/messenger.service";
import {
  DOMAIN_STORE,
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
    private readonly messengerService: MessengerService,
    @Inject(DOMAIN_STORE) private readonly domainsStore: DomainStore,
  ) {
    super(explorer, QUERY_METADATA, observableFactory, publisher);
    this._publisher.role = QUERY_PUBLISHER;
  }

  public onApplicationBootstrap(): void {
    super.onApplicationBootstrap();
    this.messengerService.publish(new QueryBusReadyMessage());
  }

  /**
   * Trigger processing of a given query in one of two ways:
   * - If the current application can process the query, meaning the {@link @moirae/core!IQuery.$executionDomain | IQuery.$executionDomain property} has been
   * registered, the query will be processed synchronously to the main thread and returned.
   * - If the current application cannot process the query, the query will be enqueued for processing
   * via a publisher for processing externally and a the results awaited for return.
   *
   * @param query - Query to be processed
   */
  public async execute<TRes>(
    query: IQuery,
    options: ExecuteOptions = {},
  ): Promise<TRes> {
    const { throwError = false } = options;
    const _key = randomUUID();
    query.$responseKey = _key;

    let res: TRes;

    if (this.domainsStore.has(query.$executionDomain)) {
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
