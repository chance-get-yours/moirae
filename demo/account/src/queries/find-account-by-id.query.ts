import { IQuery, Query, RegisterType } from "@moirae/core";
import { AccountQuery } from "./account-query.base";

@RegisterType()
export class FindAccountByIdQuery extends AccountQuery implements IQuery {
  public readonly $version: number = 1;

  constructor(public readonly id: string) {
    super();
  }
}
