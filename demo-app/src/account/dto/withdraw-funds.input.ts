import { RegisterType } from "@moirae/core";
import { IsNegative, IsNumber, IsUUID } from "class-validator";

@RegisterType()
export class WithdrawFundsInput {
  @IsUUID()
  accountId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNegative()
  funds: number;
}
