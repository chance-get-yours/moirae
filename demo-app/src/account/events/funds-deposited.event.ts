import { Event, IEvent, RegisterType } from "@moirae/core";
import { DepositFundsInput } from "../dto/deposit-funds.input";

type FundsDepositedPayload = Pick<DepositFundsInput, "funds">;

@RegisterType()
export class FundsDepositedEvent
  extends Event
  implements IEvent<FundsDepositedPayload>
{
  public readonly version: number = 1;

  constructor(
    public readonly streamId: string,
    public readonly data: FundsDepositedPayload,
  ) {
    super();
  }
}
