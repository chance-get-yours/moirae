import { IQuery, Query } from "@moirae/core";

export class HelloQuery extends Query implements IQuery {
  public readonly $executionDomain = "second_app";
  public readonly $version = 1;
}
