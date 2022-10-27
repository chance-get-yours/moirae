import { Event, IEvent, RegisterType } from "@moirae/core";
import { IInventory } from "../interfaces/inventory.interface";

type InventoryRemovedEventPayload = Pick<IInventory, "quantity">;

@RegisterType()
export class InventoryRemovedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: InventoryRemovedEventPayload,
  ) {
    super();
  }
}
