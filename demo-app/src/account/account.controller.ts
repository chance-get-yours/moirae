import { CommandBus, CommandResponse, QueryBus } from "@moirae/core";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateAccountCommand } from "./commands/create-account.command";
import { CreateAccountInput } from "./dto/create-account.input";
import { Account } from "./projections/account.entity";
import { FindAccountByIdQuery } from "./queries/find-account-by-id.query";

@Controller("/account")
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  createAccount(
    @Body() createAccountInput: CreateAccountInput,
  ): Promise<CommandResponse> {
    return this.commandBus.execute(
      new CreateAccountCommand(createAccountInput),
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Account> {
    const res = await this.queryBus.execute<Account>(
      new FindAccountByIdQuery(id),
    );
    if (res instanceof Error) throw res;
    return res;
  }
}
