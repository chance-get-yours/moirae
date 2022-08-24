import {
  ICommand,
  ICommandHandler,
  IPublisher,
  IQuery,
  IQueryHandler,
  ObservableFactory,
} from "@moirae/core";
import { ClassConstructor } from "class-transformer";
import { CommandBus } from "../busses/command.bus";
import { QueryBus } from "../busses/query.bus";
import { MoiraePluginConfig } from "../interfaces/moirae-plugin-config.interface";
import { Container } from "./container.class";

/**
 * Pseudo-DI container for Moirae
 */
export class MoiraePlugin {
  private readonly _commandBus: CommandBus;
  private readonly _commandPublisher: IPublisher;
  private readonly _queryBus: QueryBus;
  private readonly _queryPublisher: IPublisher;

  private readonly _container: Container;
  private readonly _observableFactory: ObservableFactory;

  constructor(config: MoiraePluginConfig) {
    this._commandPublisher = config.getPublisher();
    this._container = new Container();
    this._observableFactory = new ObservableFactory();
    this._queryPublisher = config.getPublisher();

    this._commandBus = new CommandBus(
      this._container,
      this._observableFactory,
      this._commandPublisher,
    );
    this._queryBus = new QueryBus(
      this._container,
      this._observableFactory,
      this._queryPublisher,
    );
  }

  public getCommandBus(): CommandBus {
    return this._commandBus;
  }

  public getQueryBus(): QueryBus {
    return this._queryBus;
  }

  /**
   * Inject a command handler for use in the application
   */
  public injectCommandHandler(
    instance: ICommandHandler<ICommand>,
    command: ClassConstructor<ICommand>,
  ): MoiraePlugin {
    this._container.register({
      command,
      instance,
      role: "CommandHandler",
    });
    return this;
  }

  /**
   * Inject a query handler for use in the application
   */
  public injectQueryHandler(
    instance: IQueryHandler<IQuery>,
    query: ClassConstructor<IQuery>,
  ): MoiraePlugin {
    this._container.register({
      instance,
      query,
      role: "QueryHandler",
    });
    return this;
  }

  /**
   * Initialize the module completely
   */
  public async init(): Promise<MoiraePlugin> {
    await this._commandPublisher["onApplicationBootstrap"]?.();
    await this._queryPublisher["onApplicationBootstrap"]?.();
    this._commandBus.onApplicationBootstrap();
    this._queryBus.onApplicationBootstrap();

    return this;
  }

  /**
   * Tear down all elements of Moirae for shutdown
   */
  public async tearDown(): Promise<MoiraePlugin> {
    await this._commandPublisher["beforeApplicationShutdown"]?.();
    await this._queryPublisher["beforeApplicationShutdown"]?.();
    return this;
  }
}
