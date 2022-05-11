import { CommandBus, CommandResponse } from "@moirae/core";
import { Body, Controller, Post } from "@nestjs/common";
import { CreateAccountCommand } from "./commands/create-account.command";
import { CreateAccountInput } from "./dto/create-account.input";

@Controller("/account")
export class AccountController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  createAccount(
    @Body() createAccountInput: CreateAccountInput,
  ): Promise<CommandResponse> {
    return this.commandBus.execute(
      new CreateAccountCommand(createAccountInput),
    );
  }
}
