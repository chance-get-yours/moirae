import { Command } from "@moirae/core";
import { ACCOUNT_DOMAIN } from "@demo/common";

export abstract class AccountCommand extends Command {
  public readonly $executionDomain = ACCOUNT_DOMAIN;
}
