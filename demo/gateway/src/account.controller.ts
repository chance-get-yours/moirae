import { CommandBus, CommandResponse, QueryBus } from "@moirae/core";
import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { CreateAccountCommand } from "@demo/account";
import { DepositFundsCommand } from "@demo/account";
import { WithdrawFundsCommand } from "@demo/account";
import { CreateAccountInput } from "@demo/common";
import { DepositFundsInput } from "@demo/common";
import { WithdrawFundsInput } from "@demo/common";
import { IAccount } from "@demo/common";
import { FindAccountByIdQuery } from "@demo/account";

@Controller("/account")
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<IAccount> {
    return this.queryBus.execute<IAccount>(new FindAccountByIdQuery(id), {
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
