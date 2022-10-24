import { CommandBus, CommandResponse } from "@moirae/core";
import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { CreateInventoryCommand } from "./commands/create-inventory.command";
import { CreateInventoryInput } from "./dto/create-inventory.input";
import { InventoryService } from "./inventory.service";
import { Inventory } from "./projections/inventory.entity";

@Controller("inventory")
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly service: InventoryService,
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
  async findById(@Param("id") id: string): Promise<Inventory> {
    const inventory = await this.service.findOne(id);
    if (!inventory) throw new NotFoundException();
    return inventory;
  }
}
