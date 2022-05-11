import { MoiraeModule } from "@moirae/core";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "./account/account.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    AccountModule,
    MoiraeModule.forRoot(),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: ":memory:",
      type: "sqlite",
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
