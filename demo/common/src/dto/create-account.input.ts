import { RegisterType } from "@moirae/core";
import { IsNumber, IsOptional, IsString } from "class-validator";

@RegisterType()
export class CreateAccountInput {
  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsString()
  name: string;
}
