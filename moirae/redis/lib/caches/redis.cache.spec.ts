import { CACHE_OPTIONS } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { RedisConnection } from "../providers/redis.connection";
import { mockConnection } from "../testing/connection.mock";
import { RedisCache } from "./redis.cache";

describe("RedisCache", () => {
  let cache: RedisCache;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RedisCache,
        { provide: CACHE_OPTIONS, useValue: {} },
        {
          provide: RedisConnection,
          useFactory: () => ({ connection: mockConnection() }),
        },
      ],
    }).compile();

    cache = module.get(RedisCache);
  });

  it("will be defined", () => {
    expect(cache).toBeDefined();
  });
});
