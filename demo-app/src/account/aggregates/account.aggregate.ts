import { AggregateRoot, Apply, Projection } from "@moirae/core";
import { AccountCreatedEvent } from "../events/account-created.event";
import { FundsDepositedEvent } from "../events/funds-deposited.event";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";
import { OrderCreatedEvent } from "../events/order-created.event";
import { IAccount } from "../interfaces/account.interface";
import { IOrder } from "../order/interfaces/order.interface";

export class AccountAggregate
  extends AggregateRoot<IAccount>
  implements IAccount
{
  @Projection()
  public name: string;
  @Projection()
  public balance: number;
  @Projection()
  public createdAt: Date;

  @Projection()
  public orders: IOrder[];

  @Projection()
  public updatedAt: Date;

  @Projection()
  public get id(): string {
    return this.streamId;
  }

  @Apply(AccountCreatedEvent)
  protected handleAccountCreated(event: AccountCreatedEvent): void {
    this.balance = event.$data.balance;
    this.createdAt = event.$data.createdAt;
    this.name = event.$data.name;
  }

  @Apply(FundsDepositedEvent)
  handleDeposit(event: FundsDepositedEvent): void {
    this.balance += event.$data.funds;
  }

  @Apply(FundsWithdrawnEvent)
  handleWithdrawal(event: FundsWithdrawnEvent): void {
    this.balance += event.$data.funds;
  }

  @Apply(OrderCreatedEvent)
  handleCreate(event: OrderCreatedEvent): void {
    const { accountId, cost, id, inventoryId, quantity } = event.$data;
    if (!this.orders) this.orders = [];
    this.orders.push({
      accountId,
      createdAt: new Date(),
      cost,
      id,
      inventoryId,
      quantity,
      updatedAt: new Date(),
    });
  }
}
