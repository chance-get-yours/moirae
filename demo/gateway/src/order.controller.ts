import { CommandBus, CommandResponse } from "@moirae/core";
import { Body, Controller, Post } from "@nestjs/common";
import { CreateOrderCommand } from "@demo/account";
import { CreateOrderInput } from "@demo/common";

@Controller("order")
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  public createOrder(
    @Body() input: CreateOrderInput,
  ): Promise<CommandResponse> {
    return this.commandBus.execute(new CreateOrderCommand(input));
  }
}
