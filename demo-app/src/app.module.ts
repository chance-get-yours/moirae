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
      database: "postgres",
      host: "localhost",
      password: "psql",
      port: 5432,
      type: "postgres",
      username: "postgres",
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
