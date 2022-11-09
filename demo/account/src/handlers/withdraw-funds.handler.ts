import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
} from "@moirae/core";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { WithdrawFundsCommand } from "../commands/withdraw-funds.command";
import { FundsWithdrawnEvent } from "@demo/common";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";
import { Logger } from "@nestjs/common";

@CommandHandler(WithdrawFundsCommand)
export class WithdrawFundsHandler
  implements ICommandHandler<WithdrawFundsCommand>
{
  constructor(private readonly aggregateFactory: AggregateFactory) {}

  public async execute(command: WithdrawFundsCommand): Promise<void> {
    const { input } = command;
    const aggregate = await this.aggregateFactory.mergeContext(
      input.accountId,
      AccountAggregate,
    );
    const event = new FundsWithdrawnEvent(input.accountId, {
      funds: input.funds,
    });
    aggregate.apply(event);
    if (aggregate.balance < 0)
      throw new InvalidWithdrawalAmountException(event);
    await aggregate.commit(command);
  }
}
