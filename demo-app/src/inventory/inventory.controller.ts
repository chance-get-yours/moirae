import { CommandBus, CommandResponse } from "@moirae/core";
import { Body, Controller, Post } from "@nestjs/common";
import { CreateInventoryCommand } from "./commands/create-inventory.command";
import { CreateInventoryInput } from "./dto/create-inventory.input";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createInventory(
    @Body() input: CreateInventoryInput,
  ): Promise<CommandResponse> {
    return this.commandBus.execute<CommandResponse>(
      new CreateInventoryCommand(input),
      { throwError: true },
    );
  }
}
