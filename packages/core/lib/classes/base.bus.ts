import { Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { randomUUID } from "crypto";
import { HandlerNotFoundError } from "../exceptions/handler-not-found.error";
import { ObservableFactory } from "../factories/observable.factory";
import { ExecuteOptions } from "../interfaces/execute-options.interface";
import { IHandler } from "../interfaces/handler.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { Respondable } from "../interfaces/respondable.interface";
import { COMMAND_METADATA, ESState, QUERY_METADATA } from "../moirae.constants";
import { StateTracker } from "./state-tracker.class";

type MetadataConstant = typeof COMMAND_METADATA | typeof QUERY_METADATA;

export abstract class BaseBus<T extends Respondable>
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

  /**
   * Execute the provided command or query on a remote system
   */
  public async execute<TRes>(
    event: T,
    options: ExecuteOptions = {},
  ): Promise<TRes> {
    const { throwError = false } = options;
    const _key = randomUUID();
    event.$responseKey = _key;
    await this._publisher.publish(event);
    const res = await this._publisher.awaitResponse(_key);
    if (res.payload instanceof Error && throwError) throw res.payload;
    return res.payload as TRes;
  }

  /**
   * @internal Should not be used outside of the context of the library
   */
  protected async executeLocal(event: T): Promise<unknown> {
    const handler = this._handlerMap.get(event.$name);
    if (!handler)
      throw new HandlerNotFoundError(
        `Could not find handler for key ${event.$name}`,
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

  onApplicationBootstrap() {
    this._status.set(ESState.PREPARING);
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
    });
    this._subId = this._publisher.subscribe(this.executeLocal.bind(this));
    this._status.set(ESState.IDLE);
  }

  public publish(event: T): Promise<void> {
    return this._publisher.publish(event);
  }
}
