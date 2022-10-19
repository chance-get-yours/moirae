import { InvalidConfigurationError, PUBLISHER_OPTIONS } from "@moirae/core";
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { connect, Connection } from "amqplib";
import { IRabbitMQPublisherConfig } from "../interfaces/rabbitmq-publisher.config";

@Injectable()
export class RabbitMQConnection implements OnModuleInit, OnApplicationShutdown {
  private _connection: Connection;

  constructor(
    @Inject(PUBLISHER_OPTIONS)
    private readonly config: IRabbitMQPublisherConfig,
  ) {}

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
  }

  /**
   * @internal
   */
  public async onApplicationShutdown() {
    try {
      this._connection && (await this._connection.close());
    } catch (err) {
      Logger.error(err);
    }
  }
}
