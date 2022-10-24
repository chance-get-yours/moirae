import { EventBus, IMoiraeFilter, MoiraeFilter } from "@moirae/core";
import { WithdrawFundsCommand } from "../commands/withdraw-funds.command";
import { FundsWithdrawalFailedEvent } from "../events/funds-withdrawal-failed.event";
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
    return this.eventBus.publish(FundsWithdrawalFailedEvent.fromError(error));
  }
}
