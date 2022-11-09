import { INVENTORY_DOMAIN } from "@demo/common";
import { Command } from "@moirae/core";

export abstract class InventoryCommand extends Command {
  public readonly $executionDomain = INVENTORY_DOMAIN;
}
