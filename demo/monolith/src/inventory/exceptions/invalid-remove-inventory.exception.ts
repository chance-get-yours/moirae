import { RegisterType } from "@moirae/core";
import { InventoryRemovedEvent } from "../events/inventory-removed.event";

@RegisterType()
export class InvalidRemoveInventoryException extends Error {
  constructor(event: InventoryRemovedEvent) {
    super(
      `Cannot remove remove ${event.$data.quantity} from Inventory ${event.$streamId}`,
    );
    this.name = this.constructor.name;
  }
}
