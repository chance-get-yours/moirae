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

  describe("addToSet", () => {
    it("will add a value to a set if it doesn't exist", async () => {
      const key = faker.random.word();
      const value = faker.random.word();

      expect(await cache.addToSet(key, value)).toEqual(true);
    });

    it("will return false if the value already exists in the set", async () => {
      const key = faker.random.word();
      const value = faker.random.word();

      expect(await cache.addToSet(key, value)).toEqual(true);
      expect(await cache.addToSet(key, value)).toEqual(false);
    });
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

  describe("readFromSet", () => {
    it("will return all values from the set", async () => {
      const key = faker.random.word();
      const values = faker.random.words(5).split(" ");

      await Promise.all(values.map((value) => cache.addToSet(key, value)));

      expect(await cache.readFromSet(key)).toEqual(values);
    });

    it("will return an empty array if no values exist", async () => {
      const key = faker.random.word();

      expect(await cache.readFromSet(key)).toEqual([]);
    });

    it("will apply the transform function for each element", async () => {
      const key = faker.random.word();
      const values = faker.random.words(5).split(" ");
      const transform = jest.fn((value) => value);

      await Promise.all(values.map((value) => cache.addToSet(key, value)));

      expect(await cache.readFromSet(key, { transform })).toEqual(values);
      expect(transform).toHaveBeenCalledTimes(values.length);
      values.forEach((value) => expect(transform).toHaveBeenCalledWith(value));
    });
  });

  describe("removeFromSet", () => {
    it("will remove a value that exists in the set", async () => {
      const key = faker.random.word();
      const value = faker.random.word();

      expect(await cache.addToSet(key, value)).toEqual(true);
      expect(await cache.removeFromSet(key, value)).toEqual(true);
    });

    it("will return false for a value that doesn't exist in the set", async () => {
      const key = faker.random.word();
      const value = faker.random.word();

      expect(await cache.addToSet(key, value)).toEqual(true);
      expect(await cache.removeFromSet(key, value)).toEqual(true);
      expect(await cache.removeFromSet(key, value)).toEqual(false);
    });
  });
});
