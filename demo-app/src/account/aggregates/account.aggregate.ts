import { AggregateRoot, Apply, Projection, Rollback } from "@moirae/core";
import { AccountCreatedEvent } from "../events/account-created.event";
import { FundsDepositedEvent } from "../events/funds-deposited.event";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";
import { OrderCreatedEvent } from "../events/order-created.event";
import { RollbackFundsWithdrawnEvent } from "../events/rollback-funds-withdrawn.event";
import { RollbackOrderCreatedEvent } from "../events/rollback-order-created.event";
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

  // FUNDS DEPOSITED
  @Apply(FundsDepositedEvent)
  handleDeposit(event: FundsDepositedEvent): void {
    this.balance += event.$data.funds;
  }

  // FUNDS WITHDRAWN
  @Apply(FundsWithdrawnEvent)
  handleWithdrawal(event: FundsWithdrawnEvent): void {
    this.balance += event.$data.funds;
  }

  @Rollback(FundsWithdrawnEvent)
  createRollbackFundsWithdrawnEvent(
    event: FundsWithdrawnEvent,
  ): RollbackFundsWithdrawnEvent {
    return new RollbackFundsWithdrawnEvent(this.streamId, {
      funds: event.$data.funds,
    });
  }

  @Apply(RollbackFundsWithdrawnEvent)
  handleRollbackWithdrawal(event: RollbackFundsWithdrawnEvent): void {
    this.balance -= event.$data.funds;
  }

  // ORDER CREATED
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

  @Rollback(OrderCreatedEvent)
  createRollbackOrderCreated(
    event: OrderCreatedEvent,
  ): RollbackOrderCreatedEvent {
    return new RollbackOrderCreatedEvent(this.streamId, {
      id: event.$data.id,
    });
  }

  @Apply(RollbackOrderCreatedEvent)
  handleRollbackOrderCreated(event: RollbackOrderCreatedEvent): void {
    this.orders = this.orders.filter((order) => order.id !== event.$data.id);
  }
}
