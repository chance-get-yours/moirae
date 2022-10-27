import {
  ICacheConfig,
  IMemoryCacheConfig,
  IMemoryPublisherConfig,
  IMemoryStoreConfig,
  IMoiraeConfig,
  IPublisherConfig,
  IStoreConfig,
  MoiraeModule,
} from "@moirae/core";
import { injectRedis, IRedisCacheConfig } from "@moirae/redis";
import {
  CACHE_ENTITIES,
  injectTypeormStore,
  EventStore,
  ITypeORMStoreConfig,
  injectTypeormCache,
} from "@moirae/typeorm";
import {
  injectRabbitMQPublisher,
  IRabbitMQPublisherConfig,
} from "@moirae/rabbitmq";
import {
  InternalServerErrorException,
  Logger,
  Module,
  NotFoundException,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "@demo/account";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProcessOrderSaga } from "./common/sagas/process-order.saga";
import { InventoryModule } from "@demo/inventory";
import { UserManagementModule } from "./user-management/user-management.module";
import { GatewayModule } from "@demo/gateway";

const moiraeConfigGenerator = (): IMoiraeConfig<
  ICacheConfig,
  IStoreConfig,
  IPublisherConfig,
  IPublisherConfig,
  IPublisherConfig
> => {
  const config: IMoiraeConfig<
    IMemoryCacheConfig,
    IMemoryStoreConfig,
    IMemoryPublisherConfig,
    IMemoryPublisherConfig,
    IMemoryPublisherConfig
  > = {
    cache: {
      injector: undefined,
      type: "memory",
    },
    externalTypes: [InternalServerErrorException, NotFoundException],
    imports: [],
    publisher: {
      command: {
        injector: undefined,
        type: "memory",
      },
      event: {
        injector: undefined,
        type: "memory",
      },
      nodeId: "demo-node",
      query: {
        injector: undefined,
        type: "memory",
      },
    },
    store: {
      injector: undefined,
      type: "memory",
    },
    sagas: [ProcessOrderSaga],
  };
  const typeormImports = [];

  switch (process.env.CACHE_TYPE) {
    case "redis":
      (config.cache as unknown as IRedisCacheConfig) = {
        injector: injectRedis,
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
      (config.cache as unknown as ITypeORMStoreConfig) = {
        injector: injectTypeormCache,
        type: "typeorm",
      };
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
        injector: injectRabbitMQPublisher,
        namespaceRoot: "__demo-app__",
        type: "rabbitmq",
      };
      (config.publisher as unknown as IRabbitMQPublisherConfig) = {
        ...config.publisher,
        command: rmqConfig as IRabbitMQPublisherConfig["command"],
        event: rmqConfig as IRabbitMQPublisherConfig["event"],
        query: rmqConfig as IRabbitMQPublisherConfig["query"],
      };
      break;
  }

  switch (process.env.STORE_TYPE) {
    case "typeorm":
      (config.store as unknown as ITypeORMStoreConfig) = {
        injector: injectTypeormStore,
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
      envFilePath: "../../.env",
    }),
    InventoryModule,
    GatewayModule,
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
  providers: [AppService],
})
export class AppModule {}
