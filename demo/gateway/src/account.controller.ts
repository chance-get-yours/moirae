import { CommandBus, CommandResponse, QueryBus } from "@moirae/core";
import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import {
  CreateAccountCommand,
  DepositFundsCommand,
  WithdrawFundsCommand,
  FindAccountByIdQuery,
} from "@demo/account";
import {
  CreateAccountInput,
  DepositFundsInput,
  WithdrawFundsInput,
  IAccount,
} from "@demo/common";

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
