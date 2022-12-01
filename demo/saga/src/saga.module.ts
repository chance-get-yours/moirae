import { Module } from "@nestjs/common";
import { ProcessOrderSaga } from "./sagas/process-order.saga";

@Module({
  providers: [ProcessOrderSaga],
})
export class SagaModule {}
