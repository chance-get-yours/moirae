import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from "@moirae/core";
import { randomUUID } from "crypto";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { FundsWithdrawnEvent, IInventory } from "@demo/common";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";
import { CreateOrderCommand } from "../order/commands/create-order.command";
import { OrderCreatedEvent } from "@demo/common";
import { FindInventoryByIdQuery } from "@demo/inventory";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly factory: AggregateFactory,
    private readonly queryBus: QueryBus,
  ) {}

  public async execute(command: CreateOrderCommand): Promise<void> {
    const id = randomUUID();

    const inventory = await this.queryBus.execute<IInventory>(
      new FindInventoryByIdQuery(command.input.inventoryId),
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
  }
}
