import { Event, IEvent, RegisterType } from "@moirae/core";
import { IAccount } from "../interfaces/account.interface";

type AccountCreatedPayload = Omit<IAccount, "id" | "updatedAt">;

@RegisterType()
export class AccountCreatedEvent
  extends Event
  implements IEvent<AccountCreatedPayload>
{
  public readonly version: number = 1;

  constructor(
    public readonly streamId: string,
    public readonly data: AccountCreatedPayload,
  ) {
    super();
  }
}
