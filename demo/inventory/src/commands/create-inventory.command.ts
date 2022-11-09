import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { CreateInventoryInput } from "@demo/common";
import { InventoryCommand } from "./inventory-command.base";

@RegisterType()
export class CreateInventoryCommand
  extends InventoryCommand
  implements ICommand
{
  public readonly $version = 1;

  @Type(() => CreateInventoryInput)
  public readonly input: CreateInventoryInput;

  public STREAM_ID: string;

  constructor(input: CreateInventoryInput, requestorId: string) {
    super({ requestorId });
    this.input = input;
  }
}
