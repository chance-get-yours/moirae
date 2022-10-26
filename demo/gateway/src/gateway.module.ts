import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { InventoryController } from "./inventory.controller";
import { MoiraeWsGateway } from "./moirae-ws.gateway";
import { OrderController } from "./order.controller";

@Module({
  controllers: [AccountController, InventoryController, OrderController],
  providers: [MoiraeWsGateway],
})
export class GatewayModule {}
