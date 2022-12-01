import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { InventoryController } from "./inventory.controller";
import { MoiraeWsGateway } from "./moirae-ws.gateway";
import { OrderController } from "./order.controller";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

@Module({
  imports: [TerminusModule],
  controllers: [
    AccountController,
    InventoryController,
    OrderController,
    HealthController,
  ],
  providers: [MoiraeWsGateway],
})
export class GatewayModule {}
