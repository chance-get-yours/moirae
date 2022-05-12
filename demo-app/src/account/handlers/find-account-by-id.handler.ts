import { IQueryHandler, QueryHandler } from "@moirae/core";
import { NotFoundException } from "@nestjs/common";
import { AccountService } from "../account.service";
import { Account } from "../projections/account.entity";
import { FindAccountByIdQuery } from "../queries/find-account-by-id.query";

@QueryHandler(FindAccountByIdQuery)
export class FindAccountByIdHandler
  implements IQueryHandler<FindAccountByIdQuery>
{
  constructor(private readonly service: AccountService) {}

  public async execute({ id }: FindAccountByIdQuery): Promise<Account> {
    const account = await this.service.findOne(id);
    if (!account)
      throw new NotFoundException(`Cannot find Account matching id: ${id}`);
    return account;
  }
}
