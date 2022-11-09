import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { CreateAccountInput } from "@demo/common";
import { AccountCommand } from "./account-command.base";

@RegisterType()
export class CreateAccountCommand extends AccountCommand implements ICommand {
  public readonly $version: number = 1;

  @Type(() => CreateAccountInput)
  public readonly input: CreateAccountInput;

  public STREAM_ID: string;

  constructor(input: CreateAccountInput) {
    super();
    this.input = input;
  }
}
