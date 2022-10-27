import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IOrder } from "@demo/common";
import { Order } from "./projections/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  public findOne(id: Order["id"]): Promise<Order> {
    return this.repository.findOne({ where: { id } });
  }

  public async remove(id: Order["id"]): Promise<Order> {
    const order = await this.findOne(id);
    return this.repository.remove(order);
  }

  public save(account: IOrder): Promise<Order> {
    return this.repository.save(account);
  }
}
