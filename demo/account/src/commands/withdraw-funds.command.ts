import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { WithdrawFundsInput } from "@demo/common";
import { AccountCommand } from "./account-command.base";

@RegisterType()
export class WithdrawFundsCommand extends AccountCommand implements ICommand {
  public readonly $version = 1;

  @Type(() => WithdrawFundsInput)
  public readonly input: WithdrawFundsInput;

  public get STREAM_ID(): string {
    return this.input.accountId;
  }

  constructor(input: WithdrawFundsInput) {
    super();
    this.input = input;
  }
}
