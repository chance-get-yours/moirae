import {
  IMoiraeConfig,
  IPublisherConfig,
  IStoreConfig,
  MoiraeModule,
} from "@moirae/core";
import { IRabbitMQConfig } from "@moirae/rabbitmq-publisher";
import { EventStore, ITypeORMStoreConfig } from "@moirae/typeorm-store";
import { Module, NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "./account/account.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MoiraeWsGateway } from "./moirae-ws.gateway";

const moiraeConfigGenerator = (): IMoiraeConfig<
  IPublisherConfig,
  IStoreConfig
> => {
  const config: IMoiraeConfig<IPublisherConfig, IStoreConfig> = {
    externalTypes: [NotFoundException],
    publisher: {
      nodeId: "demo-node",
      type: "memory",
    },
  };
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
  return config;
};

@Module({
  imports: [
    AccountModule,
    ConfigModule.forRoot({
      envFilePath: "../.env",
    }),
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
