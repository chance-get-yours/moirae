import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { Logger } from "@nestjs/common";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { DepositFundsCommand } from "../commands/deposit-funds.command";
import { FundsDepositedEvent } from "../events/funds-deposited.event";

@CommandHandler(DepositFundsCommand)
export class DepositFundsHandler
  implements ICommandHandler<DepositFundsCommand>
{
  constructor(private readonly aggregateFactory: AggregateFactory) {}

  public async execute(command: DepositFundsCommand): Promise<CommandResponse> {
    const { input } = command;
    const response = new CommandResponse();
    response.streamId = input.accountId;
    try {
      const aggregate = await this.aggregateFactory.mergeContext(
        input.accountId,
        AccountAggregate,
      );
      const event = new FundsDepositedEvent(input.accountId, {
        funds: input.funds,
      });
      aggregate.apply(event);
      await aggregate.commit(command);
      response.correlationId = command.$correlationId;
      response.success = true;
    } catch (err) {
      Logger.error(err);
      response.streamId = undefined;
      response.success = false;
    }
    return response;
  }
}
