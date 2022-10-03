import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IInventory } from "./interfaces/inventory.interface";
import { Inventory } from "./projections/inventory.entity";

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
  ) {}

  public async nameExists(name: string): Promise<boolean> {
    return (await this.repository.count({ where: { name } })) > 0;
  }

  public findOne(id: Inventory["id"]): Promise<Inventory> {
    return this.repository.findOne({ where: { id } });
  }

  public save(account: IInventory): Promise<Inventory> {
    return this.repository.save(account);
  }
}
