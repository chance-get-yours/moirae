import { RegisterType } from "@moirae/core";
import { InventoryCreatedEvent } from "../events/inventory-created.event";

@RegisterType()
export class DuplicateInventoryNameException extends Error {
  constructor(public readonly event: InventoryCreatedEvent) {
    super(
      `Cannot set name of ${event.$data.name} for Inventory as it violates a unique constraint`,
    );
    this.name = this.constructor.name;
  }
}
