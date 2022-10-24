import { Command, ICommand, RegisterType } from "@moirae/core";

interface RemoveInventoryInput {
  inventoryId: string;
  orderId: string;
  quantity: number;
}

@RegisterType()
export class RemoveInventoryCommand extends Command implements ICommand {
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
