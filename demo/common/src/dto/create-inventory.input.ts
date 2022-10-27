import { RegisterType } from "@moirae/core";
import { IsNumber, IsPositive, IsString, Min } from "class-validator";

@RegisterType()
export class CreateInventoryInput {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;
}
