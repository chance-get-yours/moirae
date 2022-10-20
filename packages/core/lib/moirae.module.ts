import {
  DynamicModule,
  InjectionToken,
  Module,
  Provider,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { CommandBus } from "./busses/command.bus";
import { EventBus } from "./busses/event.bus";
import { QueryBus } from "./busses/query.bus";
import { MemoryCache } from "./caches/memory.cache";
import { ConstructorStorage } from "./classes/constructor-storage.class";
import { Explorer } from "./classes/explorer.class";
import { SagaManager } from "./classes/saga-manager.class";
import { AggregateFactory } from "./factories/aggregate.factory";
import { ObservableFactory } from "./factories/observable.factory";
import { ICacheConfig } from "./interfaces/cache-config.interface";
import { IMoiraeConfig } from "./interfaces/config.interface";
import { IMemoryCacheConfig } from "./interfaces/memory-cache-config.interface";
import { IMemoryPublisherConfig } from "./interfaces/memory-publisher-config.interface";
import { IMemoryStoreConfig } from "./interfaces/memory-store-config.interface";
import {
  IPublisherConfig,
  PublisherType,
} from "./interfaces/publisher-config.interface";
import { IStoreConfig } from "./interfaces/store-config.interface";
import {
  CACHE_OPTIONS,
  CACHE_PROVIDER,
  COMMAND_PUBLISHER,
  EVENT_PUBLISHER,
  EVENT_PUBSUB_ENGINE,
  EVENT_SOURCE,
  PublisherToken,
  PUBLISHER_OPTIONS,
  QUERY_PUBLISHER,
} from "./moirae.constants";
import { MemoryPublisher } from "./publishers/memory.publisher";
import { MemoryStore } from "./stores/memory.store";

@Module({})
export class MoiraeModule {
  public static async forRootAsync<
    TCache extends ICacheConfig = IMemoryCacheConfig,
    TStore extends IStoreConfig = IMemoryStoreConfig,
    TCommand extends IPublisherConfig = IMemoryPublisherConfig,
    TEvent extends IPublisherConfig = IMemoryPublisherConfig,
    TQuery extends IPublisherConfig = IMemoryStoreConfig,
  >(
    config: IMoiraeConfig<TCache, TStore, TCommand, TEvent, TQuery> = {},
  ): Promise<DynamicModule> {
    const {
      cache = {
        type: "memory",
      },
      externalTypes = [],
      publisher = {
        command: {
          type: "memory",
        },
        domain: "default",
        event: {
          type: "memory",
        },
        query: {
          type: "memory",
        },
      },
      sagas = [],
      store = {
        type: "memory",
      },
      imports,
    } = config;
    if (!publisher.domain) publisher.domain = "default";
    externalTypes.forEach((type) => ConstructorStorage.getInstance().set(type));

    const providers: Provider[] = [
      {
        provide: CACHE_OPTIONS,
        useValue: cache,
      },
      {
        provide: PUBLISHER_OPTIONS,
        useValue: publisher,
      },
    ];
    const exports: InjectionToken[] = [PUBLISHER_OPTIONS, EVENT_PUBSUB_ENGINE];

    // Configure the cache providers
    switch (cache.type) {
      case "redis":
        const { RedisCache, RedisConnection } = await import("@moirae/redis");
        providers.push(RedisConnection, {
          provide: CACHE_PROVIDER,
          useClass: RedisCache,
        });
        exports.push(RedisConnection);
        break;
      case "typeorm":
        const { TypeORMCache } = await import("@moirae/typeorm");
        providers.push({
          provide: CACHE_PROVIDER,
          useClass: TypeORMCache,
        });
        break;
      default:
        providers.push({
          provide: CACHE_PROVIDER,
          useClass: MemoryCache,
        });
    }

    const configurePublisher = async (
      type: PublisherType,
      token: PublisherToken,
      providers: Provider[],
      exports: InjectionToken[],
    ): Promise<void> => {
      switch (type) {
        case "rabbitmq":
          const { RabbitMQConnection, RabbitMQPublisher, RabbitPubSubEngine } =
            await import("@moirae/rabbitmq");

          if (token === EVENT_PUBLISHER)
            providers.push({
              provide: EVENT_PUBSUB_ENGINE,
              useClass: RabbitPubSubEngine,
            });

          providers.push(RabbitMQConnection, {
            provide: token,
            useClass: RabbitMQPublisher,
          });

          exports.push(RabbitMQConnection);
          break;
        default:
          providers.push(
            {
              provide: token,
              useClass: MemoryPublisher,
            },
            {
              provide: EVENT_PUBSUB_ENGINE,
              inject: [ObservableFactory],
              useFactory: (factory: ObservableFactory) =>
                factory.generateDistributor(randomUUID()),
            },
          );
      }
    };

    // Configure the publisher providers
    await Promise.all([
      configurePublisher(
        publisher.command.type,
        COMMAND_PUBLISHER,
        providers,
        exports,
      ),
      configurePublisher(
        publisher.event.type,
        EVENT_PUBLISHER,
        providers,
        exports,
      ),
      configurePublisher(
        publisher.query.type,
        QUERY_PUBLISHER,
        providers,
        exports,
      ),
    ]);

    // Configure the event store providers
    switch (store.type) {
      case "typeorm":
        const { TypeORMStore } = await import("@moirae/typeorm");
        providers.push({
          provide: EVENT_SOURCE,
          useClass: TypeORMStore,
        });
        break;
      default:
        providers.push({
          provide: EVENT_SOURCE,
          useClass: MemoryStore,
        });
    }

    // TODO: separate public vs private deps
    return {
      global: true,
      module: MoiraeModule,
      imports,
      providers: [
        AggregateFactory,
        CommandBus,
        EventBus,
        Explorer,
        ObservableFactory,
        QueryBus,
        SagaManager,
        ...providers,
        ...sagas,
      ],
      exports: [AggregateFactory, CommandBus, EventBus, QueryBus, ...exports],
    };
  }
}
