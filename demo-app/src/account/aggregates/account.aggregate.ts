import { AggregateRoot } from "@moirae/core";
import { IAccount } from "../interfaces/account.interface";

export class AccountAggregate extends AggregateRoot implements IAccount {
  public id: string;
  public name: string;
  public balance: number;
  public createdAt: Date;
  public updatedAt: Date;
}
