import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { CreateAccountInput } from "@demo/common";

@RegisterType()
export class CreateAccountCommand extends Command implements ICommand {
  public readonly $version: number = 1;

  @Type(() => CreateAccountInput)
  public readonly input: CreateAccountInput;

  public STREAM_ID: string;

  constructor(input: CreateAccountInput) {
    super();
    this.input = input;
  }
}
