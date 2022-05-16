import { AggregateRoot, Apply, Projection } from "@moirae/core";
import { AccountCreatedEvent } from "../events/account-created.event";
import { FundsDepositedEvent } from "../events/funds-deposited.event";
import { IAccount } from "../interfaces/account.interface";

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
  public updatedAt: Date;

  @Projection()
  public get id(): string {
    return this.streamId;
  }

  @Apply(AccountCreatedEvent)
  handleAccountCreated(event: AccountCreatedEvent): void {
    this.balance = event.data.balance;
    this.createdAt = event.data.createdAt;
    this.name = event.data.name;
  }

  @Apply(FundsDepositedEvent)
  handleDeposit(event: FundsDepositedEvent): void {
    this.balance += event.data.funds;
  }
}
