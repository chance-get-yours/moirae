import { faker } from "@faker-js/faker";
import { CACHE_OPTIONS } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { KeyValue } from "../entities/key-value.entity";
import { SetRoot } from "../entities/set-root.entity";
import { SetValue } from "../entities/set-value.entity";
import {
  createMockRepository,
  MockRepository,
} from "../testing/createMockRepository";
import { TypeORMCache } from "./typeorm.cache";

describe("TypeORMCache", () => {
  let cache: TypeORMCache;
  let keyValueRepository: MockRepository<KeyValue>;
  let setRootRepository: MockRepository<SetRoot>;
  let setValueRepository: MockRepository<SetValue>;

  let key: string;
  let formattedKey: string;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TypeORMCache,
        {
          provide: getRepositoryToken(KeyValue),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(SetRoot),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(SetValue),
          useFactory: createMockRepository,
        },
        {
          provide: CACHE_OPTIONS,
          useValue: {},
        },
      ],
    }).compile();

    cache = module.get(TypeORMCache);
    keyValueRepository = module.get(getRepositoryToken(KeyValue));
    setRootRepository = module.get(getRepositoryToken(SetRoot));
    setValueRepository = module.get(getRepositoryToken(SetValue));

    key = faker.random.word();
    formattedKey = cache["formatKey"](key);
  });

  it("will be defined", () => {
    expect(cache).toBeDefined();
  });

  it("will call drop for a key", async () => {
    await cache.dropKey(key);
    expect(keyValueRepository.delete).toHaveBeenCalledWith({
      key: formattedKey,
    });
  });

  it("will call drop for a set", async () => {
    await cache.dropSet(key);
    expect(setValueRepository.delete).toHaveBeenCalledWith({
      setKey: formattedKey,
    });
    expect(setRootRepository.delete).toHaveBeenCalledWith({
      key: formattedKey,
    });
  });

  describe("handleAddToSet", () => {
    let value: string;

    beforeEach(() => {
      value = faker.random.word();
    });

    it("will add if set does not exist", async () => {
      setValueRepository.findOne.mockResolvedValue(undefined);
      setRootRepository.count.mockResolvedValue(0);

      expect(await cache["handleAddToSet"](key, value)).toEqual(true);

      expect(setValueRepository.findOne).toHaveBeenCalledWith({
        where: { setKey: formattedKey, value },
      });
      expect(setRootRepository.count).toHaveBeenCalledWith({
        where: { key: formattedKey },
      });
      expect(setRootRepository.save).toHaveBeenCalledWith({
        key: formattedKey,
        values: [{ value }],
      });
    });

    it("will add if set exists", async () => {
      setValueRepository.findOne.mockResolvedValue(undefined);
      setRootRepository.count.mockResolvedValue(1);

      expect(await cache["handleAddToSet"](key, value)).toEqual(true);

      expect(setValueRepository.findOne).toHaveBeenCalledWith({
        where: { setKey: formattedKey, value },
      });
      expect(setRootRepository.count).toHaveBeenCalledWith({
        where: { key: formattedKey },
      });
      expect(setValueRepository.save).toHaveBeenCalledWith({
        setKey: formattedKey,
        value,
      });
    });

    it("will return false if value already exists in the set", async () => {
      setValueRepository.findOne.mockResolvedValue({});

      expect(await cache["handleAddToSet"](key, value)).toEqual(false);

      expect(setValueRepository.findOne).toHaveBeenCalledWith({
        where: { setKey: formattedKey, value },
      });
      expect(setRootRepository.count).not.toHaveBeenCalled();
    });
  });

  describe("handleGetKey", () => {
    it("will return the key", async () => {
      const value = faker.random.word();
      keyValueRepository.findOne.mockResolvedValue({ value });

      expect(await cache["handleGetKey"](key)).toEqual(value);

      expect(keyValueRepository.findOne).toHaveBeenCalledWith({
        where: { key: formattedKey },
      });
    });

    it("will return undefined if key doesn't exist", async () => {
      keyValueRepository.findOne.mockResolvedValue(null);

      expect(await cache["handleGetKey"](key)).toEqual(undefined);
    });
  });

  it("will read from a set", async () => {
    const values = [{ value: faker.random.word() }];
    setValueRepository.find.mockResolvedValue(values);

    expect(await cache["handleReadFromSet"](key)).toEqual(
      values.map((v) => v.value),
    );

    expect(setValueRepository.find).toHaveBeenCalledWith({
      where: { setKey: formattedKey },
    });
  });

  describe("handleRemoveFromSet", () => {
    it("will return true if exists", async () => {
      const value = { value: faker.random.word() };
      setValueRepository.findOne.mockResolvedValue(value);

      expect(await cache["handleRemoveFromSet"](key, value.value)).toEqual(
        true,
      );

      expect(setValueRepository.findOne).toHaveBeenCalledWith({
        where: { setKey: formattedKey, value: value.value },
      });
      expect(setValueRepository.remove).toHaveBeenCalledWith(value);
    });

    it("will return false if doesn't exist", async () => {
      const value = { value: faker.random.word() };
      setValueRepository.findOne.mockResolvedValue(undefined);

      expect(await cache["handleRemoveFromSet"](key, value.value)).toEqual(
        false,
      );

      expect(setValueRepository.findOne).toHaveBeenCalledWith({
        where: { setKey: formattedKey, value: value.value },
      });
      expect(setValueRepository.remove).not.toHaveBeenCalled();
    });
  });

  it("will set a key", async () => {
    const value = faker.random.word();

    expect(await cache["handleSetKey"](key, value)).toEqual(true);

    expect(keyValueRepository.save).toHaveBeenCalledWith({
      key: formattedKey,
      value,
    });
  });
});
