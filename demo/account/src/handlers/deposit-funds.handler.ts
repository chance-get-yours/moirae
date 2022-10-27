import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
} from "@moirae/core";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { DepositFundsCommand } from "../commands/deposit-funds.command";
import { FundsDepositedEvent } from "@demo/common";

@CommandHandler(DepositFundsCommand)
export class DepositFundsHandler
  implements ICommandHandler<DepositFundsCommand>
{
  constructor(private readonly aggregateFactory: AggregateFactory) {}

  public async execute(command: DepositFundsCommand): Promise<void> {
    const { input } = command;
    const aggregate = await this.aggregateFactory.mergeContext(
      input.accountId,
      AccountAggregate,
    );
    const event = new FundsDepositedEvent(input.accountId, {
      funds: input.funds,
    });
    aggregate.apply(event);
    await aggregate.commit(command);
  }
}
