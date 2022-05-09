import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountController } from "./account.controller";
import { Account } from "./projections/account.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
})
export class AccountModule {}
