import { Event, IEvent, RegisterType } from "@moirae/core";
import { CreateInventoryInput } from "../dto/create-inventory.input";
import { DuplicateInventoryNameException } from "../exceptions/duplicate-inventory-name.exception";

@RegisterType()
export class InventoryCreatedFailedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: CreateInventoryInput & { message: string },
  ) {
    super();
  }

  public static fromError(
    err: DuplicateInventoryNameException,
  ): InventoryCreatedFailedEvent {
    return new InventoryCreatedFailedEvent(err.event.$streamId, {
      message: err.message,
      name: err.event.$data.name,
      price: err.event.$data.price,
      quantity: err.event.$data.quantity,
    });
  }
}
