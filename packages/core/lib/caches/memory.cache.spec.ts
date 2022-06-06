import { faker } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { TestEvent } from "../../testing-classes/test.event";
import { MemoryCache } from "./memory.cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MemoryCache],
    }).compile();

    cache = module.get(MemoryCache);
  });

  it("will be defined", () => {
    expect(cache).toBeDefined();
  });

  describe("getKey", () => {
    it("will get a value set internally", async () => {
      const key = faker.random.word();
      const value = faker.random.word();

      await cache.setKey(key, value);

      expect(await cache.getKey(key)).toEqual(value);
    });

    it("will return undefined if the value doesn't exist", async () => {
      const key = faker.random.word();

      expect(await cache.getKey(key)).toEqual(undefined);
    });

    it("will apply the transform", async () => {
      const key = faker.random.word();
      const value = new TestEvent();

      await cache.setKey(key, value);

      expect(
        await cache.getKey(key, {
          transform: (v) => plainToInstance(TestEvent, v),
        }),
      ).toEqual(value);
    });
  });

  describe("setKey", () => {
    it("will set a value internally", async () => {
      const key = faker.random.word();
      const value = faker.random.word();

      const setSpy = jest.spyOn(cache["_keyValue"], "set");

      expect(await cache.setKey(key, value)).toEqual(true);

      expect(setSpy).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });
});
