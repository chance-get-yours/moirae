import { Event, IEvent, RegisterType } from "@moirae/core";
import { IInventory } from "../interfaces/inventory.interface";

type InventoryCreatedEventPayload = Pick<
  IInventory,
  "createdAt" | "name" | "price" | "quantity"
>;

@RegisterType()
export class InventoryCreatedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: InventoryCreatedEventPayload,
  ) {
    super();
  }
}
