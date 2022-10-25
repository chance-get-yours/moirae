import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { InventoryController } from "./inventory.controller";
import { OrderController } from "./order.controller";

@Module({
  controllers: [AccountController, InventoryController, OrderController],
})
export class GatewayModule {}
