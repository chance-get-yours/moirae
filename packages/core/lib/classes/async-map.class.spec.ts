import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { AsyncMapTimeoutError } from "../exceptions/async-map-timeout.error";
import { AsyncMap } from "./async-map.class";
import { Distributor } from "./distributor.class";

describe("AsyncMap", () => {
  let map: AsyncMap;

  beforeEach(() => {
    map = new AsyncMap(new Distributor(new EventEmitter(), randomUUID()));
  });

  it("will function like a normal map", () => {
    const key = "hello world";
    const value = { hello: "world" };

    expect(map.has(key)).toBe(false);
    expect(map.get(key)).toEqual(undefined);
    const defaultValue = "me";

    expect(map.get(key, defaultValue)).toEqual(defaultValue);

    map.set(key, value);
    expect(map.has(key)).toBe(true);
    expect(map.get(key)).toEqual(value);

    map.delete(key);

    expect(map.has(key)).toBe(false);
  });

  it("will await the insertion of a value", async () => {
    const timeout = 500;
    const startTime = Date.now();
    const key = "hello";
    const value = "world";

    setTimeout(() => {
      map.set(key, value);
    }, timeout);
    expect(map.has(key)).toBe(false);

    expect(await map.waitGet(key)).toEqual(value);
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(timeout);
  });

  it("will throw a timeout exception after a fixed period", async () => {
    const key = "hello";

    await expect(() => map.waitGet(key, 400)).rejects.toBeInstanceOf(
      AsyncMapTimeoutError,
    );
  });
});
