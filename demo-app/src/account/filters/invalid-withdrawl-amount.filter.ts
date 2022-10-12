import { EventBus, IMoiraeFilter, MoiraeFilter } from "@moirae/core";
import { FundsWithdrawalFailedEvent } from "../events/funds-withdrawal-failed.event";
import { InvalidWithdrawalAmountException } from "../exceptions/invalid-withdrawal-amount.exception";

@MoiraeFilter(InvalidWithdrawalAmountException)
export class InvalidWithdrawalAmountFilter
  implements IMoiraeFilter<InvalidWithdrawalAmountException>
{
  constructor(private readonly eventBus: EventBus) {}

  catch(error: InvalidWithdrawalAmountException): void | Promise<void> {
    return this.eventBus.publish(FundsWithdrawalFailedEvent.fromError(error));
  }
}
