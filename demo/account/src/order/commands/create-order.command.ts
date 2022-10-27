import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { CreateOrderInput } from "@demo/common";

@RegisterType()
export class CreateOrderCommand extends Command implements ICommand {
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
