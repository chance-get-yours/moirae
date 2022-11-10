import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { DepositFundsInput } from "@demo/common";
import { AccountCommand } from "./account-command.base";

@RegisterType()
export class DepositFundsCommand extends AccountCommand implements ICommand {
  public readonly $version = 1;

  @Type(() => DepositFundsInput)
  public readonly input: DepositFundsInput;

  public get STREAM_ID(): string {
    return this.input.accountId;
  }

  constructor(input: DepositFundsInput) {
    super();
    this.input = input;
  }
}
