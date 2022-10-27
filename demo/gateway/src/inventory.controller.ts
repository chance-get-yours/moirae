import { CommandBus, CommandResponse, QueryBus } from "@moirae/core";
import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import {
  CreateInventoryCommand,
  FindInventoryByIdQuery,
} from "@demo/inventory";
import { CreateInventoryInput, IInventory } from "@demo/common";

@Controller("inventory")
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createInventory(
    @Body() input: CreateInventoryInput,
    @Headers("x-requestorId") requestorId: string,
  ): Promise<CommandResponse> {
    return this.commandBus.execute<CommandResponse>(
      new CreateInventoryCommand(input, requestorId),
    );
  }

  @Get("/:id")
  async findById(@Param("id") id: string): Promise<IInventory> {
    return this.queryBus.execute(new FindInventoryByIdQuery(id), {
      throwError: true,
    });
  }
}
