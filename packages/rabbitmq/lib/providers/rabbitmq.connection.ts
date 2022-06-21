import { PUBLISHER_OPTIONS } from "@moirae/core";
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { connect, Connection } from "amqplib";
import { IRabbitMQConfig } from "../interfaces/rabbitmq.config";

@Injectable()
export class RabbitMQConnection implements OnModuleInit, OnApplicationShutdown {
  private _connection: Connection;

  constructor(
    @Inject(PUBLISHER_OPTIONS) private readonly config: IRabbitMQConfig,
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
    this._connection = await connect(this.config.amqplib);
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
