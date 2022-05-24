import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateOrderHandler } from "./handlers/create-order.handler";
import { Order } from "./projections/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [CreateOrderHandler],
})
export class OrderModule {}
