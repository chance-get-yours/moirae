import { BeforeApplicationShutdown, Inject, Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { SagaManager } from "../classes/saga-manager.class";
import { StateTracker } from "../classes/state-tracker.class";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommand } from "../interfaces/command.interface";
import { IEventHandler } from "../interfaces/event-handler.interface";
import { IEventSource } from "../interfaces/event-source.interface";
import { IEvent } from "../interfaces/event.interface";
import { IPubSub } from "../interfaces/pub-sub.interface";
import {
  ESState,
  EVENT_METADATA,
  EVENT_PUBSUB_ENGINE,
  EVENT_SOURCE,
} from "../moirae.constants";
import { CommandBus } from "./command.bus";

/**
 * Provide handling for an event based system
 */
@Injectable()
export class EventBus implements BeforeApplicationShutdown {
  private readonly _handlerMap: Map<string, IEventHandler<IEvent>[]>;
  private _status: StateTracker<ESState>;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly _moduleContainer: ModulesContainer,
    private readonly _observableFactory: ObservableFactory,
    private readonly _sagaManager: SagaManager,
    @Inject(EVENT_SOURCE) private readonly eventSource: IEventSource,
    @Inject(EVENT_PUBSUB_ENGINE) private readonly pubSub: IPubSub,
  ) {
    this._handlerMap = new Map();
    this._status = this._observableFactory.generateStateTracker<ESState>(
      ESState.NOT_READY,
    );
  }

  public async beforeApplicationShutdown() {
    // await this._status.await(ESState.IDLE);
    // this._status.set(ESState.SHUTTING_DOWN);
  }

  protected async executeLocal(event: IEvent): Promise<void> {
    this._status.set(ESState.ACTIVE);
    const handlers = this._handlerMap.get(event.$name) || [];
    const handlerResults = await Promise.allSettled(
      handlers.map((handler) => handler.execute(event)),
    );
    let commands: ICommand[];
    if (handlerResults.some((result) => result.status === "rejected")) {
      commands = await this._sagaManager.rollbackSagas(event.$correlationId);
    } else {
      commands = await this._sagaManager.applyEventToSagas(event);
    }
    commands
      .filter((command) => !!command)
      .forEach((command) => {
        if (event.$correlationId) command.$correlationId = event.$correlationId;
        command.$disableResponse = true;
        this.commandBus.publish(command);
      });
    this._status.set(ESState.IDLE);
    await this.pubSub.publish(event);
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
    });
    this.eventSource.subscribe(this.executeLocal.bind(this));
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
