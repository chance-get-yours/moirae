import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { Logger } from "@nestjs/common";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { WithdrawFundsCommand } from "../commands/withdraw-funds.command";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";

@CommandHandler(WithdrawFundsCommand)
export class WithdrawFundsHandler
  implements ICommandHandler<WithdrawFundsCommand>
{
  constructor(private readonly aggregateFactory: AggregateFactory) {}

  public async execute(
    command: WithdrawFundsCommand,
  ): Promise<CommandResponse> {
    const { input } = command;
    const response = new CommandResponse();
    response.streamId = input.accountId;
    try {
      const aggregate = await this.aggregateFactory.mergeContext(
        input.accountId,
        AccountAggregate,
      );
      const event = new FundsWithdrawnEvent(input.accountId, {
        funds: input.funds,
      });
      if (aggregate.balance + event.$data.funds < 0)
        throw new InvalidWithdrawalAmountException(event);
      aggregate.apply(event);
      await aggregate.commit(command);
      response.correlationId = command.$correlationId;
      response.success = true;
    } catch (err) {
      Logger.error(err);
      response.error = err;
      response.streamId = undefined;
      response.success = false;
    }
    return response;
  }
}
