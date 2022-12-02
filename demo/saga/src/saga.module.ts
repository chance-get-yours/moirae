import { Module } from "@nestjs/common";
import { MoiraeModule } from "@moirae/core";
import { ProcessOrderSaga } from "./sagas/process-order.saga";

@Module({
  imports: [MoiraeModule.forFeature(["sagas"])],
  providers: [ProcessOrderSaga],
})
export class SagaModule {}
