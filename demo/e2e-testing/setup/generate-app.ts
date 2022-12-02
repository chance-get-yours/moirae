import { Logger, Module, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AccountModule } from "@demo/account";
import { InventoryModule } from "@demo/inventory";
import { GatewayModule } from "@demo/gateway";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MoiraeModule } from "@moirae/core";
import { Application } from "express";
import { WsAdapter } from "@nestjs/platform-ws";
import { SagaModule } from "@demo/saga";
import { moiraeConfigGenerator } from "./moirae-config-generator";

type TestableApplication = {
  server: Application;
  close: () => Promise<void>;
};

export function makeDemoApplication(): Promise<TestableApplication> {
  return process.env.MODE === "cluster"
    ? generateDistributed()
    : generateMonolith();
}

async function generateDistributed(): Promise<TestableApplication> {
  const pubType = process.env.PUB_TYPE;
  const storeType = process.env.STORE_TYPE;

  if (!pubType || pubType === "memory")
    throw new Error("Cannot use memory publishers in a cluster");
  if (!storeType || storeType === "memory")
    throw new Error("Cannot use memory store in a cluster");

  const config = ConfigModule.forRoot({
    envFilePath: "../../.env",
  });

  const moirae = (nodeId: string) =>
    MoiraeModule.forRootAsync(moiraeConfigGenerator(nodeId));

  const typeorm = TypeOrmModule.forRoot({
    autoLoadEntities: true,
    database: process.env.NODE_ENV === "test" ? ":memory:" : "demo.db",
    dropSchema: process.env.NODE_ENV === "test",
    type: "sqlite",
    synchronize: true,
  });

  @Module({
    imports: [GatewayModule, config, moirae("gateway"), typeorm],
  })
  class GatewayApp {}

  @Module({
    imports: [AccountModule, config, moirae("account"), typeorm],
  })
  class AccountApp {}

  @Module({
    imports: [InventoryModule, config, moirae("inventory"), typeorm],
  })
  class InventoryApp {}

  @Module({
    imports: [SagaModule, config, moirae("saga"), typeorm],
  })
  class SagaApp {}

  const [gateway, ...rest] = await Promise.all([
    NestFactory.create(GatewayApp, {
      logger: new Logger("Gateway"),
    }),
    NestFactory.create(AccountApp, {
      logger: new Logger("Account"),
    }),
    NestFactory.create(InventoryApp, {
      logger: new Logger("Inventory"),
    }),
    NestFactory.create(SagaApp, {
      logger: new Logger("Saga"),
    }),
  ]);

  gateway.useGlobalPipes(new ValidationPipe({}));
  gateway.useWebSocketAdapter(new WsAdapter(gateway));

  await gateway.init();
  await Promise.all(rest.map((app) => app.init()));
  const server: Application = gateway.getHttpServer();

  return {
    async close() {
      await gateway.close();
      await Promise.all(rest.map((app) => app.close()));
    },
    server,
  };
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
      MoiraeModule.forRootAsync(moiraeConfigGenerator("monolith")),
      SagaModule,
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
