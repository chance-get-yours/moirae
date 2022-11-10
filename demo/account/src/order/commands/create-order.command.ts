import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { CreateOrderInput } from "@demo/common";
import { AccountCommand } from "../../commands/account-command.base";

@RegisterType()
export class CreateOrderCommand extends AccountCommand implements ICommand {
  public readonly $version = 1;

  @Type(() => CreateOrderInput)
  public readonly input: CreateOrderInput;

  public get STREAM_ID(): string {
    return this.input.accountId;
  }

  constructor(input: CreateOrderInput) {
    super();
    this.input = input;
  }
}
