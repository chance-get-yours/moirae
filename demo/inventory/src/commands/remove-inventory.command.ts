import { Command, ICommand, RegisterType } from "@moirae/core";
import { INVENTORY_DOMAIN } from "@demo/common";
import { InventoryCommand } from "./inventory-command.base";

interface RemoveInventoryInput {
  inventoryId: string;
  orderId: string;
  quantity: number;
}

@RegisterType()
export class RemoveInventoryCommand
  extends InventoryCommand
  implements ICommand
{
  public readonly $version = 1;

  public readonly input: RemoveInventoryInput;

  public get STREAM_ID(): string {
    return this.input.inventoryId;
  }

  constructor(input: RemoveInventoryInput) {
    super();
    this.input = input;
  }
}
