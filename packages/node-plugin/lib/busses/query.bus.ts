import {
  ESState,
  Explorer,
  IHandler,
  IPublisher,
  IQuery,
  ObservableFactory,
  QueryBus as MoiraeQueryBus,
} from "@moirae/core";
import { Container } from "../classes/container.class";
import { RegisterQueryHandlerInput } from "../interfaces/register-container-input.interface";

export class QueryBus extends MoiraeQueryBus {
  private readonly container: Container;
  constructor(
    container: Container,
    observableFactory: ObservableFactory,
    publisher: IPublisher,
  ) {
    super(container as unknown as Explorer, observableFactory, publisher);
    this.container = container;
  }

  onApplicationBootstrap() {
    this._status.set(ESState.PREPARING);
    this.container
      .getInstances()
      .filter((provider) => provider.role === "QueryHandler")
      .forEach((provider: RegisterQueryHandlerInput) => {
        const { query, instance } = provider;
        if (!instance) return;
        this._handlerMap.set(query.name, instance as IHandler<IQuery, unknown>);
      });
    this._publisher.subscribe(this.executeLocal.bind(this));
    this._status.set(ESState.IDLE);
  }
}
