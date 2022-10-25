export { UniqueConstraintError } from "./src/exceptions/unique-contrstraint.error";
export type { IDynamicAggregate } from "./src/interfaces/dynamic-aggregate.interface";

// dto
export { CreateAccountInput } from "./src/dto/create-account.input";
export { DepositFundsInput } from "./src/dto/deposit-funds.input";
export { WithdrawFundsInput } from "./src/dto/withdraw-funds.input";

export { CreateOrderInput } from "./src/dto/create-order.input";

// events
export { AccountCreatedEvent } from "./src/events/account-created.event";
export { FundsDepositedEvent } from "./src/events/funds-deposited.event";
export { FundsWithdrawalFailedEvent } from "./src/events/funds-withdrawal-failed.event";
export { FundsWithdrawnEvent } from "./src/events/funds-withdrawn.event";
export { RollbackFundsWithdrawnEvent } from "./src/events/rollback-funds-withdrawn.event";

export { OrderCreatedEvent } from "./src/events/order-created.event";
export { RollbackOrderCreatedEvent } from "./src/events/rollback-order-created.event";

// interfaces
export type { IAccount } from "./src/interfaces/account.interface";
export type { IOrder } from "./src/interfaces/order.interface";
