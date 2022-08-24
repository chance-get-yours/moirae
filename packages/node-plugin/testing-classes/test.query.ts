import { IQuery, Query } from "@moirae/core";

export class TestQuery extends Query implements IQuery {
  public readonly $version = 1;

  public readonly input: string;

  constructor() {
    super();
    this.input = "Hello World";
  }
}
