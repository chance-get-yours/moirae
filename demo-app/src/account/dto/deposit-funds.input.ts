import { RegisterType } from "@moirae/core";
import { IsNumber, IsPositive, IsUUID } from "class-validator";

@RegisterType()
export class DepositFundsInput {
  @IsUUID()
  accountId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  funds: number;
}
