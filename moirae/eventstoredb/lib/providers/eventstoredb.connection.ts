import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  Inject,
} from "@nestjs/common";
import { EventStoreDBClient } from "@eventstore/db-client";
import { STORE_OPTIONS } from "@moirae/core";
import { IEventStoreConfig } from "../interfaces/eventstore-config.interface";

@Injectable()
export class EventStoreDBConnection
  implements OnModuleInit, OnApplicationShutdown
{
  private _connection: EventStoreDBClient;

  constructor(
    @Inject(STORE_OPTIONS) private readonly options: IEventStoreConfig,
  ) {}

  public get connection(): EventStoreDBClient {
    return this._connection;
  }

  public async onApplicationShutdown() {
    await this._connection.dispose();
  }

  public onModuleInit() {
    this._connection = EventStoreDBClient.connectionString(
      this.options.connectionString,
    );
  }
}
