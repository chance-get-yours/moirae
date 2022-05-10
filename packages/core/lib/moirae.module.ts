import { DynamicModule, Module } from "@nestjs/common";
import { ConstructorStorage } from "./classes/constructor-storage.class";
import { AggregateFactory } from "./factories/aggregate.factory";
import { ObservableFactory } from "./factories/observable.factory";
import { IConfig } from "./interfaces/config.interface";
import { PUBLISHER } from "./moirae.constants";
import { MemoryPublisher } from "./publishers/memory.publisher";

@Module({})
export class MoiraeModule {
  public static forRoot(config: IConfig = {}): DynamicModule {
    const { externalTypes = [], publisher = MemoryPublisher } = config;
    externalTypes.forEach((type) => ConstructorStorage.getInstance().set(type));
    return {
      global: true,
      module: MoiraeModule,
      providers: [
        AggregateFactory,
        ObservableFactory,
        {
          provide: PUBLISHER,
          useClass: publisher,
        },
      ],
    };
  }
}
