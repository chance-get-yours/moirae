import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateInventoryHandler } from "./handlers/create-inventory.handler";
import { InventoryCreatedHandler } from "./handlers/inventory-created.handler";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { Inventory } from "./projections/inventory.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  providers: [
    CreateInventoryHandler,
    InventoryCreatedHandler,
    InventoryService,
  ],
  controllers: [InventoryController],
})
export class InventoryModule {}
