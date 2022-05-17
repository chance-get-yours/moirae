import {
  DynamicModule,
  InjectionToken,
  Module,
  Provider,
} from "@nestjs/common";
import { CommandBus } from "./busses/command.bus";
import { EventBus } from "./busses/event.bus";
import { QueryBus } from "./busses/query.bus";
import { ConstructorStorage } from "./classes/constructor-storage.class";
import { AggregateFactory } from "./factories/aggregate.factory";
import { ObservableFactory } from "./factories/observable.factory";
import { IMoiraeConfig } from "./interfaces/config.interface";
import { MemoryPublisherConfig } from "./interfaces/memory-publisher-config.interface";
import { IPublisherConfig } from "./interfaces/publisher-config.interface";
import { EVENT_SOURCE, PUBLISHER, PUBLISHER_OPTIONS } from "./moirae.constants";
import { MemoryPublisher } from "./publishers/memory.publisher";
import { MemoryStore } from "./stores/memory.store";

@Module({})
export class MoiraeModule {
  public static async forRootAsync<
    TPub extends IPublisherConfig = MemoryPublisherConfig,
  >(config: IMoiraeConfig<TPub> = {}): Promise<DynamicModule> {
    const {
      externalTypes = [],
      publisher = {
        type: "memory",
      },
      store = MemoryStore,
    } = config;
    externalTypes.forEach((type) => ConstructorStorage.getInstance().set(type));

    const publisherProviders: Provider[] = [
      {
        provide: PUBLISHER_OPTIONS,
        useValue: publisher,
      },
    ];
    const publisherExports: InjectionToken[] = [PUBLISHER_OPTIONS];

    switch (publisher.type) {
      case "rabbitmq":
        const { RabbitMQConnection, RabbitMQPublisher } = await import(
          "@moirae/rabbitmq-publisher"
        );

        publisherProviders.push(RabbitMQConnection, {
          provide: PUBLISHER,
          useClass: RabbitMQPublisher,
        });

        publisherExports.push(RabbitMQConnection);
        break;
      default:
        publisherProviders.push({
          provide: PUBLISHER,
          useClass: MemoryPublisher,
        });
    }

    // TODO: separate public vs private deps
    return {
      global: true,
      module: MoiraeModule,
      providers: [
        AggregateFactory,
        CommandBus,
        EventBus,
        ObservableFactory,
        QueryBus,
        ...publisherProviders,
        {
          provide: EVENT_SOURCE,
          useClass: store,
        },
      ],
      exports: [
        AggregateFactory,
        CommandBus,
        EventBus,
        QueryBus,
        ...publisherExports,
      ],
    };
  }
}
