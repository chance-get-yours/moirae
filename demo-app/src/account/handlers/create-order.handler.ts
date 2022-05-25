import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { randomUUID } from "crypto";
import { InventoryAggregate } from "../../inventory/aggregates/inventory.aggregate";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";
import { OrderCreatedEvent } from "../events/order-created.event";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";
import { CreateOrderCommand } from "../order/commands/create-order.command";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly factory: AggregateFactory) {}

  public async execute(command: CreateOrderCommand): Promise<CommandResponse> {
    const response = new CommandResponse();
    response.correlationId = command.$correlationId;

    const id = randomUUID();

    const inventory = await this.factory.mergeContext(
      command.input.inventoryId,
      InventoryAggregate,
    );

    const cost = inventory.price * command.input.quantity;
    const account = await this.factory.mergeContext(
      command.input.accountId,
      AccountAggregate,
    );

    const orderCreated = new OrderCreatedEvent(account.id, {
      cost,
      id,
      ...command.input,
    });

    account.apply(orderCreated);

    const withdrawFunds = new FundsWithdrawnEvent(account.id, {
      funds: cost * -1,
    });

    if (account.balance - cost < 0)
      throw new InvalidWithdrawalAmountException(withdrawFunds);

    account.apply(withdrawFunds);

    await account.commit(command);

    response.streamId = account.id;
    response.success = true;
    return response;
  }
}
