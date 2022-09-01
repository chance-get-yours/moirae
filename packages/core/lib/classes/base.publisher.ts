import {
  BeforeApplicationShutdown,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { AsyncMap } from "../classes/async-map.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IPublisherConfig } from "../interfaces/publisher-config.interface";
import { Respondable } from "../interfaces/respondable.interface";
import { EventProcessor } from "../mixins/event-processor.mixin";
import { ESState, PublisherRole } from "../moirae.constants";
import { Distributor } from "./distributor.class";
import { ResponseWrapper } from "./response.class";
import { StateTracker } from "./state-tracker.class";

export const EVENT_KEY = "__event_key__";

export abstract class BasePublisher<Evt extends Respondable>
  extends EventProcessor<Evt>
  implements
    OnApplicationBootstrap,
    BeforeApplicationShutdown,
    EventProcessor<Evt>
{
  protected _distributor: Distributor<Evt>;
  protected _responseMap: AsyncMap<ResponseWrapper<unknown>>;
  protected _status: StateTracker<ESState>;
  protected readonly _uuid: string;

  public role: PublisherRole;

  constructor(
    observableFactory: ObservableFactory,
    protected readonly publisherOptions: IPublisherConfig,
  ) {
    super();
    this._uuid = randomUUID();

    this._distributor = observableFactory.generateDistributor(this._uuid);
    this._responseMap = observableFactory.generateAsyncMap();
    this._status = observableFactory.generateStateTracker<ESState>(
      ESState.NOT_READY,
    );
    this._uuid = randomUUID();
  }

  protected get _key(): string {
    return `${this._uuid}:${EVENT_KEY}`;
  }

  public async acknowledgeEvent(event: Evt): Promise<void> {
    this._status.set(ESState.IDLE);
    await this.handleAcknowledge(event);
  }

  public async awaitResponse(
    responseKey: string,
  ): Promise<ResponseWrapper<unknown>> {
    const response = await this._responseMap.waitGet(responseKey);
    this._responseMap.delete(responseKey);
    return response;
  }

  public async beforeApplicationShutdown() {
    this._status.set(ESState.SHUTTING_DOWN);
    await this.handleShutdown();
    this._distributor.clear();
    this._status.set(ESState.NOT_READY);
  }

  protected abstract handleAcknowledge(event: Evt): Promise<void>;
  protected abstract handleBootstrap(): Promise<void>;
  protected abstract handlePublish(
    eventString: string,
    executionDomain: string,
  ): Promise<void>;
  /**
   * Handle publishing the response outbound
   */
  protected abstract handleResponse(
    routingKey: string,
    responseJSON: string,
  ): Promise<void>;
  protected abstract handleShutdown(): Promise<void>;

  /**
   * Listen to the publisher asynchronously without interacting with publisher state
   */
  public listen(handlerFn: (event: Evt) => void): string {
    return this._distributor.subscribe((event: Evt) => {
      handlerFn(event);
    });
  }

  public async onApplicationBootstrap() {
    this._status.set(ESState.PREPARING);
    await this.handleBootstrap();
    this._status.set(ESState.IDLE);
  }

  /**
   * Publish an event to the wider system
   */
  public async publish(event: Evt): Promise<void> {
    event.$routingKey = this.publisherOptions.nodeId;
    const serialized = this.serializeEvent(event);
    await this.handlePublish(serialized, event.$executionDomain || "default");
  }

  protected parseResponse(responseString: string): ResponseWrapper<unknown> {
    const responsePlain = JSON.parse(responseString);
    return ResponseWrapper.fromPlain(responsePlain);
  }

  /**
   * Subscribe to the publisher as a worker.
   */
  public subscribe(handlerFn: (event: Evt) => Promise<any> | any): string {
    return this._distributor.subscribe(async (evt: Evt) => {
      const res = await handlerFn(evt);
      if (!evt.$disableResponse && !!evt.$responseKey && !!evt.$routingKey) {
        const response = new ResponseWrapper(
          res,
          evt.$responseKey,
          evt.$routingKey,
        );
        await this.handleResponse(
          evt.$routingKey,
          JSON.stringify(response.toPlain()),
        );
      }
      await this.acknowledgeEvent(evt);
    });
  }

  public unsubscribe(key: string): void {
    this._distributor.unsubscribe(key);
  }
}
