import { IQuery, Query, RegisterType } from "@moirae/core";

@RegisterType()
export class FindAccountByIdQuery extends Query implements IQuery {
  public readonly $version: number = 1;

  constructor(public readonly id: string) {
    super();
  }
}
