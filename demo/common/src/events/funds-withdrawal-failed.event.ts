import { Event, IEvent, RegisterType } from "@moirae/core";
import { WithdrawFundsInput } from "../dto/withdraw-funds.input";

@RegisterType()
export class FundsWithdrawalFailedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: Pick<WithdrawFundsInput, "funds">,
  ) {
    super();
  }
}
