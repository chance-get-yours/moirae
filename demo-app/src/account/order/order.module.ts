import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderCreatedHandler } from "./handlers/order-created.handler";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./projections/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderCreatedHandler, OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
