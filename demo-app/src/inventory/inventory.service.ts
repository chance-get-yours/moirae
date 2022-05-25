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

  public findOne(id: Inventory["id"]): Promise<Inventory> {
    return this.repository.findOne(id);
  }

  public save(account: IInventory): Promise<Inventory> {
    return this.repository.save(account);
  }
}
