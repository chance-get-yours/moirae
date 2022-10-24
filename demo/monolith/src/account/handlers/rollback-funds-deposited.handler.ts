import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { RollbackFundsWithdrawnEvent } from "../events/rollback-funds-withdrawn.event";

@EventHandler(RollbackFundsWithdrawnEvent)
export class RollbackFundsWithdrawnHandler
  implements IEventHandler<RollbackFundsWithdrawnEvent>
{
  constructor(
    private readonly factory: AggregateFactory,
    private readonly service: AccountService,
  ) {}

  public async execute(event: RollbackFundsWithdrawnEvent): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      event.$streamId,
      AccountAggregate,
    );
    await this.service.save(aggregate.toProjection());
  }
}
