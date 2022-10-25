import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { OrderController } from "./order.controller";

@Module({
  controllers: [AccountController, OrderController],
})
export class GatewayModule {}
