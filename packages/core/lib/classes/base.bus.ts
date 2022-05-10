import { Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { randomUUID } from "crypto";
import { HandlerNotFoundError } from "../exceptions/handler-not-found.error";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventLike } from "../interfaces/event-like.interface";
import { IHandler } from "../interfaces/handler.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import {
  COMMAND_METADATA,
  ESState,
  EVENT_METADATA,
  QUERY_METADATA,
} from "../moirae.constants";
import { StateTracker } from "./state-tracker.class";

type MetadataConstant =
  | typeof COMMAND_METADATA
  | typeof EVENT_METADATA
  | typeof QUERY_METADATA;

export abstract class BaseBus<T extends IEventLike>
  implements OnApplicationBootstrap
{
  protected _handlerMap: Map<string, IHandler<T>>;
  protected _status: StateTracker<ESState>;
  private _subId: string;

  constructor(
    private readonly _metadataConstant: MetadataConstant,
    protected readonly _moduleContainer: ModulesContainer,
    protected readonly _observableFactory: ObservableFactory,
    protected readonly _publisher: IPublisher,
  ) {
    this._handlerMap = new Map();
    this._status = this._observableFactory.generateStateTracker<ESState>(
      ESState.NOT_READY,
    );
  }

  public async execute<TRes>(event: T): Promise<TRes> {
    const _key = randomUUID();
    event.responseKey = _key;
    await this._publisher.publish(event);
    const res = await this._publisher.awaitResponse(_key);
    return res.payload as TRes;
  }

  protected async executeLocal(event: T): Promise<unknown> {
    const handler = this._handlerMap.get(event.name);
    if (!handler)
      throw new HandlerNotFoundError(
        `Could not find handler for key ${event.name}`,
      );
    let res: unknown;
    try {
      res = await handler.execute(event);
    } catch (err) {
      Logger.error(err);
      res = err;
    }
    return res;
  }

  protected handleProvider(
    instance: InstanceWrapper<unknown>["instance"],
  ): void {
    // stub
  }

  public listen(handlerFn: (event: T) => void): string {
    return this._publisher.listen(handlerFn);
  }

  onApplicationBootstrap() {
    const providers = [...this._moduleContainer.values()].flatMap((module) => [
      ...module.providers.values(),
    ]);
    providers.forEach((provider) => {
      const { instance } = provider;
      if (!instance) return;
      if (Reflect.hasMetadata(this._metadataConstant, instance.constructor)) {
        const command = Reflect.getMetadata(
          this._metadataConstant,
          instance.constructor,
        );
        this._handlerMap.set(command.name, instance as IHandler<T>);
      }
      this.handleProvider(instance);
    });
    this._subId = this._publisher.subscribe(this.executeLocal.bind(this));
  }

  public publish(event: T): Promise<void> {
    return this._publisher.publish(event);
  }

  public removeListener(subId: string): void {
    this._publisher.unsubscribe(subId);
  }
}
