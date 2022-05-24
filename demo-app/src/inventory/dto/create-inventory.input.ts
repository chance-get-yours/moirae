import { RegisterType } from "@moirae/core";
import { IsNumber, IsString, Min } from "class-validator";

@RegisterType()
export class CreateInventoryInput {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}
