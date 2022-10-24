import { CommandBus, CommandResponse, QueryBus } from "@moirae/core";
import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { CreateAccountCommand } from "./commands/create-account.command";
import { DepositFundsCommand } from "./commands/deposit-funds.command";
import { WithdrawFundsCommand } from "./commands/withdraw-funds.command";
import { CreateAccountInput } from "./dto/create-account.input";
import { DepositFundsInput } from "./dto/deposit-funds.input";
import { WithdrawFundsInput } from "./dto/withdraw-funds.input";
import { Account } from "./projections/account.entity";
import { FindAccountByIdQuery } from "./queries/find-account-by-id.query";

@Controller("/account")
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Account> {
    return this.queryBus.execute<Account>(new FindAccountByIdQuery(id), {
      throwError: true,
    });
  }

  @Post()
  createAccount(
    @Body() createAccountInput: CreateAccountInput,
  ): Promise<CommandResponse> {
    return this.commandBus.execute(
      new CreateAccountCommand(createAccountInput),
    );
  }

  @Put("/deposit")
  depositFunds(@Body() input: DepositFundsInput): Promise<CommandResponse> {
    return this.commandBus.execute(new DepositFundsCommand(input));
  }

  @Put("/withdraw")
  async withdrawFunds(
    @Body() input: WithdrawFundsInput,
  ): Promise<CommandResponse> {
    return this.commandBus.execute<CommandResponse>(
      new WithdrawFundsCommand(input),
    );
  }
}
