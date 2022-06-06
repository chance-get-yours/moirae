import { faker } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { MemoryManager } from "./memory.manager";

describe("MemoryManager", () => {
  let manager: MemoryManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MemoryManager],
    }).compile();

    manager = module.get(MemoryManager);
  });

  it("will be defined", () => {
    expect(manager).toBeDefined();
  });

  describe("reservations", () => {
    it("will reserve a value that doesn't exist", async () => {
      expect(await manager.reserveValue("hello", "world")).toEqual(true);
    });

    it("will block a reservation that already exists", async () => {
      const key = faker.lorem.word();
      const value = faker.lorem.word();

      await manager.reserveValue(key, value);
      expect(await manager.reserveValue(key, value)).toEqual(false);
    });

    it("will release a value that exists", async () => {
      const key = faker.lorem.word();
      const value = faker.lorem.word();

      await manager.reserveValue(key, value);
      expect(await manager.releaseValue(key, value)).toEqual(true);
      expect(await manager.reserveValue(key, value)).toEqual(true);
    });

    it("will release a value that doesn't exist", async () => {
      const key = faker.lorem.word();
      const value = faker.lorem.word();

      expect(await manager.releaseValue(key, value)).toEqual(true);
      expect(await manager.reserveValue(key, value)).toEqual(true);
    });
  });
});
