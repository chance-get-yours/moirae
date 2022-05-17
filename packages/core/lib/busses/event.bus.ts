import { Inject, Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { StateTracker } from "../classes/state-tracker.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventHandler } from "../interfaces/event-handler.interface";
import { IEventSource } from "../interfaces/event-source.interface";
import { IEvent } from "../interfaces/event.interface";
import { IPubSub } from "../interfaces/pub-sub.interface";
import { SagaHandler } from "../interfaces/saga-handler.interface";
import {
  ESState,
  EVENT_METADATA,
  EVENT_PUBSUB_ENGINE,
  EVENT_SOURCE,
  SAGA_METADATA,
} from "../moirae.constants";
import { CommandBus } from "./command.bus";

/**
 * Provide handling for an event based system
 */
@Injectable()
export class EventBus {
  private readonly _handlerMap: Map<string, IEventHandler<IEvent>[]>;
  private readonly _sagas: SagaHandler[];
  private _status: StateTracker<ESState>;
  private _subId: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly _moduleContainer: ModulesContainer,
    private readonly _observableFactory: ObservableFactory,
    @Inject(EVENT_SOURCE) private readonly eventSource: IEventSource,
    @Inject(EVENT_PUBSUB_ENGINE) private readonly pubSub: IPubSub,
  ) {
    this._handlerMap = new Map();
    this._status = this._observableFactory.generateStateTracker<ESState>(
      ESState.NOT_READY,
    );
    this._sagas = [];
  }

  protected async executeLocal(event: IEvent): Promise<void> {
    this._status.set(ESState.ACTIVE);
    const handlers = this._handlerMap.get(event.name) || [];
    await Promise.allSettled(handlers.map((handler) => handler.execute(event)));
    const commands = this._sagas
      .flatMap((saga) => saga(event))
      .filter((command) => !!command);
    commands.forEach((command) => {
      this.commandBus.publish(command);
    });
    this._status.set(ESState.IDLE);
    await this.pubSub.publish(event);
  }

  protected handleProvider(instance: unknown): void {
    if (Reflect.hasMetadata(SAGA_METADATA, instance.constructor)) {
      Reflect.getMetadata(SAGA_METADATA, instance.constructor).forEach(
        (key) => {
          this._sagas.push(instance[key].bind(instance));
        },
      );
    }
  }

  /**
   * Listen to events post-processing
   */
  public listen(handlerFn: (event: IEvent) => void): string {
    return this.pubSub.subscribe(handlerFn);
  }

  onApplicationBootstrap() {
    this._status.set(ESState.PREPARING);
    const providers = [...this._moduleContainer.values()].flatMap((module) => [
      ...module.providers.values(),
    ]);
    providers.forEach((provider) => {
      const { instance } = provider;
      if (!instance) return;
      if (Reflect.hasMetadata(EVENT_METADATA, instance.constructor)) {
        const event = Reflect.getMetadata(EVENT_METADATA, instance.constructor);
        if (!this._handlerMap.has(event.name))
          this._handlerMap.set(event.name, []);
        this._handlerMap
          .get(event.name)
          .push(instance as IEventHandler<IEvent>);
      }
      this.handleProvider(instance);
    });
    this._subId = this.eventSource.subscribe(this.executeLocal.bind(this));
    this._status.set(ESState.IDLE);
  }

  public async publish(event: IEvent): Promise<void> {
    await this.eventSource.appendToStream([event]);
  }

  /**
   * Unsubscribe to events post-processing
   */
  public removeListener(subId: string): void {
    this.pubSub.unsubscribe(subId);
  }
}
