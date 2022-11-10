import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { INVENTORY_DOMAIN } from "@demo/common";
import { MoiraeModule } from "@moirae/core";
import { InventoryCreatedFailedFilter } from "./filters/inventory-created-failed.filter";
import { CreateInventoryHandler } from "./handlers/create-inventory.handler";
import { FindInventoryByIdHandler } from "./handlers/find-inventory-by-id.handler";
import { InventoryCreatedHandler } from "./handlers/inventory-created.handler";
import { InventoryRemovedHandler } from "./handlers/inventory-removed.handler";
import { RemoveInventoryHandler } from "./handlers/remove-inventory.handler";
import { InventoryService } from "./inventory.service";
import { Inventory } from "./projections/inventory.entity";

@Module({
  imports: [
    MoiraeModule.forFeature([INVENTORY_DOMAIN]),
    TypeOrmModule.forFeature([Inventory]),
  ],
  providers: [
    CreateInventoryHandler,
    FindInventoryByIdHandler,
    InventoryCreatedHandler,
    InventoryRemovedHandler,
    InventoryService,
    InventoryCreatedFailedFilter,
    RemoveInventoryHandler,
  ],
})
export class InventoryModule {}
