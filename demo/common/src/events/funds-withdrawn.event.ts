import { Event, IEvent, RegisterType } from "@moirae/core";
import { WithdrawFundsInput } from "../dto/withdraw-funds.input";

type FundsWithdrawnPayload = Pick<WithdrawFundsInput, "funds">;

@RegisterType()
export class FundsWithdrawnEvent
  extends Event
  implements IEvent<FundsWithdrawnPayload>
{
  public readonly $version: number = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: FundsWithdrawnPayload,
  ) {
    super();
  }
}
