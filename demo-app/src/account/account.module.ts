import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { AccountCreatedHandler } from "./handlers/account-created.handler";
import { CreateAccountHandler } from "./handlers/create-account.handler";
import { Account } from "./projections/account.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
  providers: [AccountCreatedHandler, AccountService, CreateAccountHandler],
  exports: [AccountService],
})
export class AccountModule {}
