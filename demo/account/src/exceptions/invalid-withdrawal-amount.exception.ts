import { RegisterType } from "@moirae/core";
import { FundsWithdrawnEvent } from "@demo/common";

@RegisterType()
export class InvalidWithdrawalAmountException extends Error {
  constructor(public readonly event: FundsWithdrawnEvent) {
    super(
      `Cannot withdraw ${event.$data.funds} from account ${event.$streamId}`,
    );
    this.name = this.constructor.name;
  }
}
