import { makeDemoApplication } from "./generate-app";

async function bootstrap() {
  process.env.PUB_TYPE = "rabbitmq";
  process.env.CACHE_TYPE = "redis";
  process.env.STORE_TYPE = "typeorm";
  process.env.MODE = "cluster";
  await makeDemoApplication();
}
bootstrap();
