import { BeforeApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { AsyncMap } from "../classes/async-map.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventLike } from "../interfaces/event-like.interface";
import { ESState } from "../moirae.constants";
import { ConstructorStorage } from "./constructor-storage.class";
import { ResponseWrapper } from "./response.class";
import { StateTracker } from "./state-tracker.class";

export abstract class BasePublisher<Evt extends IEventLike>
  implements OnModuleInit, BeforeApplicationShutdown
{
  protected readonly _observableFactory: ObservableFactory;
  protected _responseMap: AsyncMap<string>;
  protected _status: StateTracker<ESState>;
  protected _subscriptions: Map<string, (eventString: string) => void>;

  constructor(observableFactory: ObservableFactory) {
    this._observableFactory = observableFactory;
    this._responseMap = this._observableFactory.generateAsyncMap();
    this._status = this._observableFactory.generateStateTracker<ESState>(
      ESState.NOT_READY,
    );
  }

  public async acknowledgeEvent(event: Evt): Promise<void> {
    this._status.set(ESState.IDLE);
    await this.handleAcknowledge(event);
  }

  public async awaitResponse(
    responseKey: string,
  ): Promise<ResponseWrapper<unknown>> {
    const responseString = await this._responseMap.waitGet(responseKey);
    this._responseMap.delete(responseKey);
    const responsePlain = JSON.parse(responseString);
    return ResponseWrapper.fromPlain(responsePlain);
  }

  public async beforeApplicationShutdown() {
    this._status.set(ESState.SHUTTING_DOWN);
    await this.handleShutdown();
    this._subscriptions.clear();
    this._status.set(ESState.NOT_READY);
  }

  protected abstract handleAcknowledge(event: Evt): Promise<void>;
  protected abstract handleBootstrap(): Promise<void>;
  protected abstract handleResponse(
    responseKey: string,
    responseJSON: string,
  ): Promise<void>;
  protected abstract handleShutdown(): Promise<void>;
  protected abstract handleSubscribe(
    handlerFn: (eventString: string) => void,
  ): string;
  protected abstract handleUnsubscribe(key: string): void;

  /**
   * Listen to the publisher asynchronously without interacting with publisher state
   */
  public listen(handlerFn: (event: Evt) => void): string {
    return this.handleSubscribe((eventString: string) => {
      const parsedEvent = this.parseEvent(eventString);
      handlerFn(parsedEvent);
    });
  }

  public async onModuleInit() {
    this._status.set(ESState.PREPARING);
    this._subscriptions = new Map();
    await this.handleBootstrap();
    this._status.set(ESState.IDLE);
  }

  protected parseEvent(eventString: string): Evt {
    const plain: Evt = JSON.parse(eventString);
    const InstanceConstructor = ConstructorStorage.getInstance().get(
      plain.name,
    );
    return plainToInstance(InstanceConstructor, plain) as Evt;
  }

  public serializeEvent(event: Evt): string {
    const plain = instanceToPlain(event);
    return JSON.stringify(plain);
  }

  /**
   * Subscribe to the publisher as a worker.
   */
  public subscribe(handlerFn: (event: Evt) => Promise<any> | any): string {
    return this.handleSubscribe(async (eventString) => {
      this._status.set(ESState.ACTIVE);
      const parsedEvent = this.parseEvent(eventString);
      const res = await handlerFn(parsedEvent);
      if (!!res && !parsedEvent.disableResponse && !!parsedEvent.responseKey) {
        const response = new ResponseWrapper(res);
        await this.handleResponse(
          parsedEvent.responseKey,
          JSON.stringify(response.toPlain()),
        );
      }
      await this.acknowledgeEvent(parsedEvent);
    });
  }

  public unsubscribe(key: string): void {
    this.handleUnsubscribe(key);
    this._subscriptions.delete(key);
  }
}
