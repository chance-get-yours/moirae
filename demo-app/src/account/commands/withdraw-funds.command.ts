import { Command, ICommand, RegisterType } from "@moirae/core";
import { Type } from "class-transformer";
import { WithdrawFundsInput } from "../dto/withdraw-funds.input";

@RegisterType()
export class WithdrawFundsCommand extends Command implements ICommand {
  public readonly $version = 1;

  @Type(() => WithdrawFundsInput)
  public readonly input: WithdrawFundsInput;

  constructor(input: WithdrawFundsInput) {
    super();
    this.input = input;
  }
}
