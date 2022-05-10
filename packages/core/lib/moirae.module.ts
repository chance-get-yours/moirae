import { DynamicModule, Module } from "@nestjs/common";
import { QueryBus } from "./busses/query.bus";
import { ConstructorStorage } from "./classes/constructor-storage.class";
import { AggregateFactory } from "./factories/aggregate.factory";
import { ObservableFactory } from "./factories/observable.factory";
import { IConfig } from "./interfaces/config.interface";
import { EVENT_SOURCE, PUBLISHER } from "./moirae.constants";
import { MemoryPublisher } from "./publishers/memory.publisher";
import { MemoryStore } from "./stores/memory.store";

@Module({})
export class MoiraeModule {
  public static forRoot(config: IConfig = {}): DynamicModule {
    const {
      externalTypes = [],
      publisher = MemoryPublisher,
      store = MemoryStore,
    } = config;
    externalTypes.forEach((type) => ConstructorStorage.getInstance().set(type));
    return {
      global: true,
      module: MoiraeModule,
      providers: [
        AggregateFactory,
        ObservableFactory,
        QueryBus,
        {
          provide: PUBLISHER,
          useClass: publisher,
        },
        {
          provide: EVENT_SOURCE,
          useClass: store,
        },
      ],
    };
  }
}
