import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ICacheConfig,
  IMemoryCacheConfig,
  IMemoryPublisherConfig,
  IMemoryStoreConfig,
  IMoiraeConfig,
  IPublisherConfig,
  IStoreConfig,
} from "@moirae/core";
import { injectRedis, IRedisCacheConfig } from "@moirae/redis";
import {
  CACHE_ENTITIES,
  EventStore,
  injectTypeormCache,
  injectTypeormStore,
  ITypeORMStoreConfig,
} from "@moirae/typeorm";
import {
  injectRabbitMQPublisher,
  IRabbitMQPublisherConfig,
} from "@moirae/rabbitmq";
import { IEventStoreConfig, injectEventStoreDb } from "@moirae/eventstoredb";

export function moiraeConfigGenerator(
  nodeId: string,
): IMoiraeConfig<
  ICacheConfig,
  IStoreConfig,
  IPublisherConfig,
  IPublisherConfig,
  IPublisherConfig
> {
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
      nodeId,
      query: {
        injector: undefined,
        type: "memory",
      },
    },
    store: {
      injector: undefined,
      type: "memory",
    },
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
    case "eventstoredb":
      (config.store as unknown as IEventStoreConfig) = {
        injector: injectEventStoreDb,
        connectionString:
          "esdb+discover://localhost:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000",
        type: "eventstoredb",
      };
      break;
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
}
