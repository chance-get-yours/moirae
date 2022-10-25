import { Event, IEvent, RegisterType } from "@moirae/core";
import { CreateInventoryInput } from "../dto/create-inventory.input";

@RegisterType()
export class InventoryCreatedFailedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: CreateInventoryInput & { message: string },
  ) {
    super();
  }
}
