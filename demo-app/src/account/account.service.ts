import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IAccount } from "./interfaces/account.interface";
import { Account } from "./projections/account.entity";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private readonly repository: Repository<Account>,
  ) {}

  public findOne(id: Account["id"]): Promise<Account> {
    return this.repository.findOne(id);
  }

  public save(account: IAccount): Promise<Account> {
    return this.repository.save(account);
  }
}
