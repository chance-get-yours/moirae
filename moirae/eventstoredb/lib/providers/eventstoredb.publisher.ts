import { Inject, Injectable } from "@nestjs/common";
import {
  BasePublisher,
  DomainStore,
  DOMAIN_STORE,
  IEvent,
  IPublisher,
  ObservableFactory,
  PublisherToken,
  PUBLISHER_OPTIONS,
  ResponseWrapper,
} from "@moirae/core";
import { EventStoreDBConnection } from "./eventstoredb.connection";
import {
  PersistentSubscriptionToAllResolvedEvent,
  persistentSubscriptionToAllSettingsFromDefaults,
} from "@eventstore/db-client";
import { IEventStorePublisherConfig } from "../interfaces/eventstore-publisher-config.interface";

@Injectable()
export class EventStoreDbPublisher
  extends BasePublisher<IEvent>
  implements IPublisher
{
  public readonly role: PublisherToken;
  private _activeRequests: Map<
    IEvent["$uuid"],
    PersistentSubscriptionToAllResolvedEvent
  >;

  constructor(
    private readonly connection: EventStoreDBConnection,
    @Inject(PUBLISHER_OPTIONS) publisherOptions: IEventStorePublisherConfig,
    observableFactory: ObservableFactory,
    @Inject(DOMAIN_STORE) private readonly domainStore: DomainStore,
  ) {
    super(observableFactory, publisherOptions);
    this._activeRequests = new Map();
  }

  awaitResponse(_: string): Promise<ResponseWrapper<unknown>> {
    throw new Error("Method not implemented.");
  }

  protected handleAcknowledge(event: IEvent<unknown>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected async handleBootstrap(): Promise<void> {
    await this.connection.connection.createPersistentSubscriptionToAll(
      "",
      persistentSubscriptionToAllSettingsFromDefaults(),
    );
    const sub =
      this.connection.connection.subscribeToPersistentSubscriptionToAll("");
    sub.on("data", async (raw) => {
      const event = this.parseEvent(raw.event.data as string);
      this._activeRequests.set(event.$uuid, raw);
      await this._distributor.publish(event);
    });
  }

  protected handlePublish(
    eventString: string,
    executionDomain: string,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected handleResponse(
    routingKey: string,
    responseJSON: string,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected handleShutdown(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async onApplicationBootstrap() {
    // stub
  }
}
