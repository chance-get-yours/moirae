import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
  ICommandHandlerOptions,
} from "@moirae/core";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { CreateAccountCommand } from "../commands/create-account.command";
import { AccountCreatedEvent } from "../events/account-created.event";

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(private readonly aggregateFactory: AggregateFactory) {}

  public async execute(
    command: CreateAccountCommand,
    options: ICommandHandlerOptions,
  ): Promise<void> {
    const { input } = command;
    const aggregate = await this.aggregateFactory.mergeContext(
      options.streamId,
      AccountAggregate,
    );
    const event = new AccountCreatedEvent(options.streamId, {
      balance: 0,
      createdAt: new Date(),
      ...input,
    });
    aggregate.apply(event);
    await aggregate.commit(command);
  }
}
