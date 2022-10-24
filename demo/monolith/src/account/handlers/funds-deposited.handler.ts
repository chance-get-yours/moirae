import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { FundsDepositedEvent } from "../events/funds-deposited.event";

@EventHandler(FundsDepositedEvent)
export class FundsDepositedHandler
  implements IEventHandler<FundsDepositedEvent>
{
  constructor(
    private readonly factory: AggregateFactory,
    private readonly service: AccountService,
  ) {}

  public async execute(event: FundsDepositedEvent): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      event.$streamId,
      AccountAggregate,
    );
    await this.service.save(aggregate.toProjection());
  }
}
