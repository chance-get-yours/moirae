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
import { ConstructorStorage } from "./classes/constructor-storage.class";
import { AggregateFactory } from "./factories/aggregate.factory";
import { ObservableFactory } from "./factories/observable.factory";
import { IMoiraeConfig } from "./interfaces/config.interface";
import { IMemoryPublisherConfig } from "./interfaces/memory-publisher-config.interface";
import { IMemoryStoreConfig } from "./interfaces/memory-store-config.interface";
import { IPublisherConfig } from "./interfaces/publisher-config.interface";
import { IStoreConfig } from "./interfaces/store-config.interface";
import {
  EVENT_PUBSUB_ENGINE,
  EVENT_SOURCE,
  PUBLISHER,
  PUBLISHER_OPTIONS,
} from "./moirae.constants";
import { MemoryPublisher } from "./publishers/memory.publisher";
import { MemoryStore } from "./stores/memory.store";

@Module({})
export class MoiraeModule {
  public static async forRootAsync<
    TPub extends IPublisherConfig = IMemoryPublisherConfig,
    TStore extends IStoreConfig = IMemoryStoreConfig,
  >(config: IMoiraeConfig<TPub, TStore> = {}): Promise<DynamicModule> {
    const {
      externalTypes = [],
      publisher = {
        type: "memory",
      },
      store = {
        type: "memory",
      },
      imports,
    } = config;
    externalTypes.forEach((type) => ConstructorStorage.getInstance().set(type));

    const providers: Provider[] = [
      {
        provide: PUBLISHER_OPTIONS,
        useValue: publisher,
      },
    ];
    const exports: InjectionToken[] = [PUBLISHER_OPTIONS, EVENT_PUBSUB_ENGINE];

    switch (publisher.type) {
      case "rabbitmq":
        const { RabbitMQConnection, RabbitMQPublisher, RabbitPubSubEngine } =
          await import("@moirae/rabbitmq-publisher");

        const pubSubProvider: Provider = {
          provide: EVENT_PUBSUB_ENGINE,
          useClass: RabbitPubSubEngine,
        };

        providers.push(RabbitMQConnection, pubSubProvider, {
          provide: PUBLISHER,
          useClass: RabbitMQPublisher,
        });

        exports.push(RabbitMQConnection);
        break;
      default:
        providers.push(
          {
            provide: PUBLISHER,
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

    switch (store.type) {
      case "typeorm":
        const { TypeORMStore, EventStore, TypeOrmModule } = await import(
          "@moirae/typeorm-store"
        );
        // imports.push(TypeOrmModule.forFeature([EventStore]))
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
        ObservableFactory,
        QueryBus,
        ...providers,
      ],
      exports: [AggregateFactory, CommandBus, EventBus, QueryBus, ...exports],
    };
  }
}
