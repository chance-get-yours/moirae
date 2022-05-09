import { DynamicModule, Module } from "@nestjs/common";
import { AggregateFactory } from "./factories/aggregate.factory";
import { IConfig } from "./interfaces/config.interface";

@Module({})
export class MoiraeModule {
  public static forRoot(config: IConfig = {}): DynamicModule {
    return {
      global: true,
      module: MoiraeModule,
      providers: [AggregateFactory],
    };
  }
}
