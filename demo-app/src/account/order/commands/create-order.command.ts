import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { CreateOrderInput } from "../dto/create-order.input";

@RegisterType()
export class CreateOrderCommand extends Command implements ICommand {
  public readonly $version = 1;

  @Type(() => CreateOrderInput)
  public readonly input: CreateOrderInput;

  constructor(input: CreateOrderInput) {
    super();
    this.input = input;
  }
}
