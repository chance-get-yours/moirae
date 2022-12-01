import {
  InvalidConfigurationError,
  MessengerService,
  PUBLISHER_OPTIONS,
} from "@moirae/core";
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { connect, Connection } from "amqplib";
import { IRabbitMQPublisherConfig } from "../interfaces/rabbitmq-publisher.config";
import {
  RabbitMQConnectionClosedMessage,
  RabbitMQConnectionErrorMessage,
  RabbitMQConnectionOpenedMessage,
  RabbitMQConnectionReOpenedMessage,
} from "../messages";

/**
 * RabbitMQ Connection provider for the global scope. Will emit lifecycle events
 * via the {@link core#MessengerService}.
 *
 * @emits RabbitMQConnectionReOpenedMessage On open of connection each time
 * @emits RabbitMQConnectionReOpenedMessage On open of connection if connection has already
 * exists and been closed
 * @emits RabbitMQConnectionErrorMessage On error of connection
 * @emits RabbitMQConnectionClosedMessage On close of connection
 */
@Injectable()
export class RabbitMQConnection implements OnModuleInit, OnApplicationShutdown {
  private _connection: Connection;
  private _connectionOpenedOnce: boolean;
  private _closedSubscriptionId: string;

  constructor(
    @Inject(PUBLISHER_OPTIONS)
    private readonly config: IRabbitMQPublisherConfig,
    private readonly messengerService: MessengerService,
  ) {
    this._connectionOpenedOnce = false;
  }

  /**
   * Access to the RabbitMQConnection that is initialized with `onModuleInit`
   */
  public get connection(): Connection {
    return this._connection;
  }

  /**
   * @internal
   */
  public async onModuleInit() {
    const amqplibConfig = [
      this.config.command,
      this.config.event,
      this.config.query,
    ].find((c) => !!c.amqplib);
    if (!amqplibConfig)
      throw new InvalidConfigurationError("Missing amqplib configuration");
    this._connection = await connect(amqplibConfig.amqplib);
    this._closedSubscriptionId = this.messengerService.on(
      RabbitMQConnectionClosedMessage,
      async (message) => {
        if (message.crashed) await this.onModuleInit();
      },
    );
    this.messengerService.publish(new RabbitMQConnectionOpenedMessage());
    if (this._connectionOpenedOnce)
      this.messengerService.publish(new RabbitMQConnectionReOpenedMessage());
    this._connectionOpenedOnce = true;
    this._connection.on("error", (err) =>
      this.messengerService.publish(new RabbitMQConnectionErrorMessage(err)),
    );
    this._connection.on("close", (err) => {
      this.messengerService.publish(
        new RabbitMQConnectionClosedMessage(!!!err),
      );
    });
  }

  /**
   * @internal
   */
  public async onApplicationShutdown() {
    this.messengerService.unsubscribe(this._closedSubscriptionId);
    try {
      this._connection && (await this._connection.close());
      this.messengerService.publish(new RabbitMQConnectionClosedMessage(false));
    } catch (err) {
      Logger.error(err);
    }
  }
}
