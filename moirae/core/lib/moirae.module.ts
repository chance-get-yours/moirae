import {
  DynamicModule,
  Inject,
  InjectionToken,
  Module,
  Provider,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { InjectorFunction } from "./interfaces/injector.interface";
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
import { IPublisherConfig } from "./interfaces/publisher-config.interface";
import { IStoreConfig } from "./interfaces/store-config.interface";
import {
  CACHE_OPTIONS,
  CACHE_PROVIDER,
  COMMAND_PUBLISHER,
  DOMAIN_STORE,
  EVENT_PUBLISHER,
  EVENT_PUBSUB_ENGINE,
  EVENT_SOURCE,
  PublisherToken,
  PUBLISHER_OPTIONS,
  QUERY_PUBLISHER,
} from "./moirae.constants";
import { MemoryPublisher } from "./publishers/memory.publisher";
import { MemoryStore } from "./stores/memory.store";
import { DomainStore } from "./classes/domain-store.class";
import { MessengerService } from "./messenger/messenger.service";
import { sha1 } from "object-hash";

@Module({})
export class MoiraeModule {
  /**
   * Register a module with a domain. This enables Moirae to direct the execution of commands
   * and queries to the correct system in either a monolithic or microservice-based system.
   */
  public static forFeature(domains: string[]): DynamicModule {
    return {
      module: MoiraeModule,
      providers: [
        {
          provide: `DOMAIN_PROVIDER_${sha1({ domains })}`,
          inject: [DOMAIN_STORE],
          useFactory(store: DomainStore) {
            store.add(...domains);
            // return store;
          },
        },
      ],
    };
  }

  public static async forRootAsync<
    TCache extends ICacheConfig = IMemoryCacheConfig,
    TStore extends IStoreConfig = IMemoryStoreConfig,
    TCommand extends IPublisherConfig = IMemoryPublisherConfig,
    TEvent extends IPublisherConfig = IMemoryPublisherConfig,
    TQuery extends IPublisherConfig = IMemoryPublisherConfig,
  >(
    config: IMoiraeConfig<TCache, TStore, TCommand, TEvent, TQuery> = {},
  ): Promise<DynamicModule> {
    const memoryCacheInjector: InjectorFunction = () => {
      return {
        exports: [],
        providers: [
          {
            provide: CACHE_PROVIDER,
            useClass: MemoryCache,
          },
        ],
      };
    };
    const memoryPublisherInjector: InjectorFunction = (
      token: PublisherToken,
    ) => {
      return {
        exports: [] as InjectionToken[],
        providers: [
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
        ] as Provider[],
      };
    };

    const memoryStoreInjector: InjectorFunction = () => ({
      exports: [],
      providers: [
        {
          provide: EVENT_SOURCE,
          useClass: MemoryStore,
        },
      ],
    });

    const {
      cache = {
        injector: memoryCacheInjector,
        type: "memory",
      },
      externalTypes = [],
      publisher = {
        command: {
          injector: memoryPublisherInjector,
          type: "memory",
        },
        domain: "default",
        event: {
          injector: memoryPublisherInjector,
          type: "memory",
        },
        query: {
          injector: memoryPublisherInjector,
          type: "memory",
        },
      },
      sagas = [],
      store = {
        injector: memoryStoreInjector,
        type: "memory",
      },
      imports,
    } = config;

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

    const { exports: cacheExports, providers: cacheProviders } = (
      cache.injector || memoryCacheInjector
    )();
    const { exports: commandExports, providers: commandProviders } = (
      publisher.command.injector || memoryPublisherInjector
    )(COMMAND_PUBLISHER);
    const { exports: eventExports, providers: eventProviders } = (
      publisher.event.injector || memoryPublisherInjector
    )(EVENT_PUBLISHER);
    const { exports: queryExports, providers: queryProviders } = (
      publisher.query.injector || memoryPublisherInjector
    )(QUERY_PUBLISHER);
    const { exports: storeExports, providers: storeProviders } = (
      store.injector || memoryStoreInjector
    )();

    return {
      global: true,
      module: MoiraeModule,
      imports,
      providers: [
        AggregateFactory,
        CommandBus,
        EventBus,
        Explorer,
        MessengerService,
        ObservableFactory,
        QueryBus,
        SagaManager,
        ...providers,
        ...sagas,
        ...cacheProviders,
        ...commandProviders,
        ...eventProviders,
        ...queryProviders,
        ...storeProviders,
        {
          provide: DOMAIN_STORE,
          useClass: DomainStore,
        },
      ],
      exports: [
        AggregateFactory,
        CommandBus,
        EventBus,
        MessengerService,
        QueryBus,
        ...exports,
        ...cacheExports,
        ...commandExports,
        ...eventExports,
        ...queryExports,
        ...storeExports,
        DOMAIN_STORE,
      ],
    };
  }
}
