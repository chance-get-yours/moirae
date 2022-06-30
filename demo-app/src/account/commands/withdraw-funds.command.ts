import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { WithdrawFundsInput } from "../dto/withdraw-funds.input";

@RegisterType()
export class WithdrawFundsCommand extends Command implements ICommand {
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
