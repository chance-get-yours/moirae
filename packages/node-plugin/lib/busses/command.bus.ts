import {
  CommandBus as MoiraeCommandBus,
  ESState,
  Explorer,
  ICommand,
  IHandler,
  IPublisher,
  ObservableFactory,
  SagaManager,
} from "@moirae/core";
import { Container } from "../classes/container.class";
import { SagaManagerMock } from "../classes/saga-manager-mock.class";
import { RegisterCommandHandlerInput } from "../interfaces/register-container-input.interface";

export class CommandBus extends MoiraeCommandBus {
  private readonly container: Container;
  constructor(
    container: Container,
    observableFactory: ObservableFactory,
    publisher: IPublisher,
  ) {
    super(
      container as unknown as Explorer,
      observableFactory,
      publisher,
      new SagaManagerMock() as unknown as SagaManager,
    );
    this.container = container;
  }

  onApplicationBootstrap() {
    this._status.set(ESState.PREPARING);
    this.container
      .getInstances()
      .filter((provider) => provider.role === "CommandHandler")
      .forEach((provider: RegisterCommandHandlerInput) => {
        const { command, instance } = provider;
        if (!instance) return;
        this._handlerMap.set(
          command.name,
          instance as IHandler<ICommand, unknown>,
        );
      });
    this._publisher.subscribe(this.executeLocal.bind(this));
    this._status.set(ESState.IDLE);
  }
}