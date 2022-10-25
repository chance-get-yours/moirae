import { EventBus, IMoiraeFilter, MoiraeFilter } from "@moirae/core";
import { WithdrawFundsCommand } from "../commands/withdraw-funds.command";
import { FundsWithdrawalFailedEvent } from "@demo/common";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";

@MoiraeFilter(InvalidWithdrawalAmountException)
export class InvalidWithdrawalAmountFilter
  implements IMoiraeFilter<InvalidWithdrawalAmountException>
{
  constructor(private readonly eventBus: EventBus) {}

  catch(
    _: WithdrawFundsCommand,
    error: InvalidWithdrawalAmountException,
  ): void | Promise<void> {
    const event = new FundsWithdrawalFailedEvent(error.event.$streamId, {
      funds: error.event.$data.funds,
    });
    return this.eventBus.publish(event);
  }
}
