import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
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
  ): Promise<CommandResponse> {
    const newStreamId = randomUUID();
    const response = new CommandResponse();
    response.streamId = newStreamId;
    try {
      const { input } = command;
      const aggregate = await this.aggregateFactory.mergeContext(
        newStreamId,
        AccountAggregate,
      );
      const event = new AccountCreatedEvent(newStreamId, {
        balance: 0,
        createdAt: new Date(),
        ...input,
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
