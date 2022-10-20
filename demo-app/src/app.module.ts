import {
  ICacheConfig,
  IMoiraeConfig,
  IPublisherConfig,
  IStoreConfig,
  MoiraeModule,
} from "@moirae/core";
import { IRedisCacheConfig } from "@moirae/redis";
import {
  CACHE_ENTITIES,
  EventStore,
  ITypeORMStoreConfig,
} from "@moirae/typeorm";
import {
  InternalServerErrorException,
  Logger,
  Module,
  NotFoundException,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "./account/account.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProcessOrderSaga } from "./common/sagas/process-order.saga";
import { InventoryModule } from "./inventory/inventory.module";
import { MoiraeWsGateway } from "./moirae-ws.gateway";
import { UserManagementModule } from "./user-management/user-management.module";

const moiraeConfigGenerator = (): IMoiraeConfig<
  ICacheConfig,
  IStoreConfig,
  IPublisherConfig,
  IPublisherConfig,
  IPublisherConfig
> => {
  const config: IMoiraeConfig<
    ICacheConfig,
    IStoreConfig,
    IPublisherConfig,
    IPublisherConfig,
    IPublisherConfig
  > = {
    cache: {
      type: "memory",
    },
    externalTypes: [InternalServerErrorException, NotFoundException],
    imports: [],
    publisher: {
      command: {
        type: "memory",
      },
      event: {
        type: "memory",
      },
      nodeId: "demo-node",
      query: {
        type: "memory",
      },
    },
    store: {
      type: "memory",
    },
    sagas: [ProcessOrderSaga],
  };
  const typeormImports = [];

  switch (process.env.CACHE_TYPE) {
    case "redis":
      (config.cache as IRedisCacheConfig) = {
        namespaceRoot: "__demo-app__",
        redis: {
          socket: {
            host: "localhost",
            port: 6379,
          },
        },
        type: "redis",
      };
      break;
    case "typeorm":
      config.cache.type = "typeorm";
      typeormImports.push(...CACHE_ENTITIES);
      break;
  }

  config.cache.clear = process.env.NODE_ENV === "test";

  switch (process.env.PUB_TYPE) {
    case "rabbitmq":
      const rmqConfig = {
        amqplib: {
          hostname: process.env.RABBIT_MQ_HOST,
          password: process.env.RABBIT_MQ_PASS,
          port: +process.env.RABBIT_MQ_PORT,
          username: process.env.RABBIT_MQ_USER,
        },
        namespaceRoot: "__demo-app__",
        type: "rabbitmq",
      };
      config.publisher = {
        ...config.publisher,
        command: rmqConfig as IPublisherConfig,
        event: rmqConfig as IPublisherConfig,
        query: rmqConfig as IPublisherConfig,
      };
      break;
  }

  switch (process.env.STORE_TYPE) {
    case "typeorm":
      (config.store as ITypeORMStoreConfig) = {
        type: "typeorm",
      };
      typeormImports.push(EventStore);
      break;
  }
  Logger.log(
    `Start app with\n \tCACHE_TYPE: ${config.cache.type}\n \tPUB_TYPE: ${config.publisher.command.type}\n \tSTORE_TYPE: ${config.store.type}`,
  );
  if (typeormImports.length > 0)
    config.imports.push(TypeOrmModule.forFeature(typeormImports));
  return config;
};

@Module({
  imports: [
    AccountModule,
    ConfigModule.forRoot({
      envFilePath: "../.env",
    }),
    InventoryModule,
    MoiraeModule.forRootAsync(moiraeConfigGenerator()),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: process.env.NODE_ENV === "test" ? ":memory:" : "demo.db",
      dropSchema: process.env.NODE_ENV === "test",
      type: "sqlite",
      synchronize: true,
    }),
    UserManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService, MoiraeWsGateway],
})
export class AppModule {}
