import { Command, ICommand, RegisterType } from "@moirae/core";

interface ExportInventoryInput {
  inventoryId: string;
  quantity: number;
}

@RegisterType()
export class ExportInventoryCommand extends Command implements ICommand {
  public readonly $version = 1;

  public readonly input: ExportInventoryInput;

  constructor(input: ExportInventoryInput) {
    super();
    this.input = input;
  }
}
