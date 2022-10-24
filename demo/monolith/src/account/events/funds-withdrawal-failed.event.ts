import { Event, IEvent, RegisterType } from "@moirae/core";
import { WithdrawFundsInput } from "../dto/withdraw-funds.input";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";

@RegisterType()
export class FundsWithdrawalFailedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: Pick<WithdrawFundsInput, "funds">,
  ) {
    super();
  }

  public static fromError(
    error: InvalidWithdrawalAmountException,
  ): FundsWithdrawalFailedEvent {
    return new FundsWithdrawalFailedEvent(error.event.$streamId, {
      funds: error.event.$data.funds,
    });
  }
}
