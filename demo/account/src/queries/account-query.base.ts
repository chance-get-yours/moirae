import { ACCOUNT_DOMAIN } from "@demo/common";
import { Query } from "@moirae/core";

export abstract class AccountQuery extends Query {
  public readonly $executionDomain = ACCOUNT_DOMAIN;
}
