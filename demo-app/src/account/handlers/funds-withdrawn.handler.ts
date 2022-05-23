import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";

@EventHandler(FundsWithdrawnEvent)
export class FundsWithdrawnHandler
  implements IEventHandler<FundsWithdrawnEvent>
{
  constructor(
    private readonly aggregateFactory: AggregateFactory,
    private readonly service: AccountService,
  ) {}

  public async execute(event: FundsWithdrawnEvent): Promise<void> {
    const aggregate = await this.aggregateFactory.mergeContext(
      event.$streamId,
      AccountAggregate,
    );
    await this.service.save(aggregate.toProjection());
  }
}
