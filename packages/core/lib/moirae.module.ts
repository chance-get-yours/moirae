import { DynamicModule, Module } from "@nestjs/common";

@Module({})
export class MoiraeModule {
  public static forRoot(): DynamicModule {
    return {
      global: true,
      module: MoiraeModule,
    };
  }
}
