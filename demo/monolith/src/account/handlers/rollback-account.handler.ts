import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
} from "@moirae/core";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { RollbackAccountCommand } from "../commands/rollback-account.command";

@CommandHandler(RollbackAccountCommand)
export class RollbackAccountHandler
  implements ICommandHandler<RollbackAccountCommand>
{
  constructor(private readonly factory: AggregateFactory) {}

  public async execute(command: RollbackAccountCommand): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      command.$data.streamId,
      AccountAggregate,
    );
    aggregate.rollback(command.$data.correlationId);
    await aggregate.commit(command);
  }
}
