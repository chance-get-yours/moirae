import {
  ICacheConfig,
  IMoiraeConfig,
  IPublisherConfig,
  IStoreConfig,
  MoiraeModule,
} from "@moirae/core";
import { IRabbitMQConfig } from "@moirae/rabbitmq-publisher";
import { IRedisCacheConfig } from "@moirae/redis-cache";
import { EventStore, ITypeORMStoreConfig } from "@moirae/typeorm-store";
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

const moiraeConfigGenerator = (): IMoiraeConfig<
  ICacheConfig,
  IPublisherConfig,
  IStoreConfig
> => {
  const config: IMoiraeConfig<ICacheConfig, IPublisherConfig, IStoreConfig> = {
    cache: {
      type: "memory",
    },
    externalTypes: [InternalServerErrorException, NotFoundException],
    publisher: {
      nodeId: "demo-node",
      type: "memory",
    },
    store: {
      type: "memory",
    },
    sagas: [ProcessOrderSaga],
  };

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
  }

  config.cache.clear = process.env.NODE_ENV === "test";

  switch (process.env.PUB_TYPE) {
    case "rabbitmq":
      (config.publisher as IRabbitMQConfig) = {
        ...config.publisher,
        amqplib: {
          hostname: process.env.RABBIT_MQ_HOST,
          password: process.env.RABBIT_MQ_PASS,
          port: +process.env.RABBIT_MQ_PORT,
          username: process.env.RABBIT_MQ_USER,
        },
        namespaceRoot: "__demo-app__",
        type: "rabbitmq",
      };
  }

  switch (process.env.STORE_TYPE) {
    case "typeorm":
      (config.store as ITypeORMStoreConfig) = {
        type: "typeorm",
      };
      config.imports = [TypeOrmModule.forFeature([EventStore])];
  }
  Logger.log(
    `Start app with\n \tCACHE: ${config.cache.type}\n \tPUBLISHER: ${config.publisher.type}\n \tSTORE: ${config.store.type}`,
  );
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
  ],
  controllers: [AppController],
  providers: [AppService, MoiraeWsGateway],
})
export class AppModule {}
