import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MoiraeModule } from "@moirae/core";
import { AccountService } from "./account.service";
import { InvalidWithdrawalAmountFilter } from "./filters/invalid-withdrawl-amount.filter";
import { AccountCreatedHandler } from "./handlers/account-created.handler";
import { CreateAccountHandler } from "./handlers/create-account.handler";
import { CreateOrderHandler } from "./handlers/create-order.handler";
import { DepositFundsHandler } from "./handlers/deposit-funds.handler";
import { FindAccountByIdHandler } from "./handlers/find-account-by-id.handler";
import { FundsDepositedHandler } from "./handlers/funds-deposited.handler";
import { FundsWithdrawnHandler } from "./handlers/funds-withdrawn.handler";
import { RollbackAccountHandler } from "./handlers/rollback-account.handler";
import { WithdrawFundsHandler } from "./handlers/withdraw-funds.handler";
import { OrderModule } from "./order/order.module";
import { Account } from "./projections/account.entity";
import { ACCOUNT_DOMAIN } from "@demo/common";

@Module({
  imports: [
    MoiraeModule.forFeature([ACCOUNT_DOMAIN]),
    TypeOrmModule.forFeature([Account]),
    OrderModule,
  ],
  providers: [
    AccountCreatedHandler,
    AccountService,
    CreateAccountHandler,
    CreateOrderHandler,
    DepositFundsHandler,
    FindAccountByIdHandler,
    FundsDepositedHandler,
    FundsWithdrawnHandler,
    InvalidWithdrawalAmountFilter,
    RollbackAccountHandler,
    WithdrawFundsHandler,
  ],
  exports: [AccountService],
})
export class AccountModule {}
