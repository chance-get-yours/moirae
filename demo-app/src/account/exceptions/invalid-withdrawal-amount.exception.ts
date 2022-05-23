import { RegisterType } from "@moirae/core";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";

@RegisterType()
export class InvalidWithdrawalAmountException extends Error {
  constructor(event: FundsWithdrawnEvent) {
    super(
      `Cannot withdraw ${event.$data.funds} from account ${event.$streamId}`,
    );
    this.name = this.constructor.name;
  }
}
