import { Module, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AccountModule } from "@demo/account";
import { InventoryModule } from "@demo/inventory";
import { GatewayModule } from "@demo/gateway";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MoiraeModule } from "@moirae/core";
import { Application } from "express";
import { WsAdapter } from "@nestjs/platform-ws";

type TestableApplication = {
  server: Application;
  close: () => Promise<void>;
};

export function makeDemoApplication(): Promise<TestableApplication> {
  return generateMonolith();
}

async function generateMonolith(): Promise<TestableApplication> {
  @Module({
    imports: [
      AccountModule,
      ConfigModule.forRoot({
        envFilePath: "../../.env",
      }),
      InventoryModule,
      GatewayModule,
      MoiraeModule
        .forRootAsync
        // moiraeConfigGenerator()
        (),
      TypeOrmModule.forRoot({
        autoLoadEntities: true,
        database: process.env.NODE_ENV === "test" ? ":memory:" : "demo.db",
        dropSchema: process.env.NODE_ENV === "test",
        type: "sqlite",
        synchronize: true,
      }),
    ],
  })
  class MonolithModule {}

  const app = await NestFactory.create(MonolithModule);

  app.useGlobalPipes(new ValidationPipe({}));
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.init();
  const server: Application = app.getHttpServer();
  return {
    async close() {
      await app.close();
    },
    server,
  };
}
