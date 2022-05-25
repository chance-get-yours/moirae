import { RegisterType } from "@moirae/core";
import { IsInt, IsPositive, IsUUID } from "class-validator";

@RegisterType()
export class CreateOrderInput {
  @IsUUID()
  accountId: string;

  @IsUUID()
  inventoryId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
