import { Query } from "@moirae/core";
import { INVENTORY_DOMAIN } from "@demo/common";

export abstract class InventoryQuery extends Query {
  public readonly $executionDomain = INVENTORY_DOMAIN;
}
