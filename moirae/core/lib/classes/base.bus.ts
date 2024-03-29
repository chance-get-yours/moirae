import { Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { HandlerNotFoundError } from "../exceptions/handler-not-found.error";
import { ObservableFactory } from "../factories/observable.factory";
import { IHandler } from "../interfaces/handler.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { Respondable } from "../interfaces/respondable.interface";
import { COMMAND_METADATA, ESState, QUERY_METADATA } from "../moirae.constants";
import { Explorer } from "./explorer.class";
import { StateTracker } from "./state-tracker.class";

type MetadataConstant = typeof COMMAND_METADATA | typeof QUERY_METADATA;

export abstract class BaseBus<T extends Respondable>
  implements OnApplicationBootstrap
{
  protected _handlerMap: Map<string, IHandler<T>>;
  protected _status: StateTracker<ESState>;

  constructor(
    private readonly _explorer: Explorer,
    private readonly _metadataConstant: MetadataConstant,
    protected readonly _observableFactory: ObservableFactory,
    protected readonly _publisher: IPublisher,
  ) {
    this._handlerMap = new Map();
    this._status = this._observableFactory.generateStateTracker<ESState>(
      ESState.NOT_READY,
    );
  }

  /**
   * @internal Should not be used outside of the context of the library
   */
  protected async executeLocal(
    event: T,
    options: Record<string, unknown>,
  ): Promise<unknown> {
    const handler = this._handlerMap.get(event.$name);
    if (!handler)
      throw new HandlerNotFoundError(
        `Could not find handler for key ${event.$name}`,
      );
    let res: unknown;
    try {
      res = await handler.execute(event, options);
    } catch (err) {
      Logger.error(err);
      res = err;
    }
    return res;
  }

  protected handleInstanceImport(
    instance: InstanceWrapper<any>["instance"],
  ): void {
    // stub
  }

  onApplicationBootstrap() {
    this._status.set(ESState.PREPARING);
    this._explorer.getProviders().forEach((provider) => {
      const { instance } = provider;
      if (!instance) return;
      if (Reflect.hasMetadata(this._metadataConstant, instance.constructor)) {
        const command = Reflect.getMetadata(
          this._metadataConstant,
          instance.constructor,
        );
        this._handlerMap.set(command.name, instance as IHandler<T>);
      }
      this.handleInstanceImport(instance);
    });
    this._publisher.subscribe(this.executeLocal.bind(this));
    this._status.set(ESState.IDLE);
  }

  public publish(event: T): Promise<void> {
    if (!event.$executionDomain) event.$executionDomain = "default";
    return this._publisher.publish(event);
  }
}
