import { IQuery, Query, RegisterType } from "@moirae/core";

@RegisterType()
export class FindAccountByIdQuery extends Query implements IQuery {
  public readonly $version: number;

  constructor(public readonly id: string) {
    super();
  }
}
