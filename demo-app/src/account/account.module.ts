import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { AccountCreatedHandler } from "./handlers/account-created.handler";
import { CreateAccountHandler } from "./handlers/create-account.handler";
import { DepositFundsHandler } from "./handlers/deposit-funds.handler";
import { FindAccountByIdHandler } from "./handlers/find-account-by-id.handler";
import { FundsDepositedHandler } from "./handlers/funds-deposited.handler";
import { FundsWithdrawnHandler } from "./handlers/funds-withdrawn.handler";
import { WithdrawFundsHandler } from "./handlers/withdraw-funds.handler";
import { Account } from "./projections/account.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
  providers: [
    AccountCreatedHandler,
    AccountService,
    CreateAccountHandler,
    DepositFundsHandler,
    FindAccountByIdHandler,
    FundsDepositedHandler,
    FundsWithdrawnHandler,
    WithdrawFundsHandler,
  ],
  exports: [AccountService],
})
export class AccountModule {}
