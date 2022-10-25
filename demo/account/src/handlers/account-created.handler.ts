import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { AccountCreatedEvent } from "@demo/common";

@EventHandler(AccountCreatedEvent)
export class AccountCreatedHandler
  implements IEventHandler<AccountCreatedEvent>
{
  constructor(
    private readonly aggregateFactory: AggregateFactory,
    private readonly service: AccountService,
  ) {}

  public async execute(event: AccountCreatedEvent): Promise<void> {
    const aggregate = await this.aggregateFactory.mergeContext(
      event.$streamId,
      AccountAggregate,
    );
    await this.service.save(aggregate.toProjection());
  }
}
