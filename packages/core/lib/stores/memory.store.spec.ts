import { faker } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { TestEvent } from "../classes/aggregate-root.class.spec";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventSource } from "../interfaces/event-source.interface";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { MemoryStore } from "./memory.store";

describe("MemoryStore", () => {
  let store: IEventSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MemoryPublisher, MemoryStore, ObservableFactory],
    }).compile();

    store = await module.resolve(MemoryStore);
    await store["onModuleInit"]();
  });

  it("will be defined", () => {
    expect(store).toBeDefined();
  });

  describe("persistance", () => {
    it("will store events based on streamId", async () => {
      const event = new TestEvent();
      event.streamId = faker.datatype.uuid();

      expect(await store.appendToStream([event])).toStrictEqual([event]);
      expect(store["_streams"].get(event.streamId)).toHaveLength(1);
    });
    it("will call the subscriber function for events", async () => {
      const event = new TestEvent();
      event.streamId = faker.datatype.uuid();

      const subFn = jest.fn();
      store.subscribe(subFn);

      await store.appendToStream([event]);
      expect(subFn).toHaveBeenCalledWith(event);
    });
  });

  describe("read from stream", () => {
    it("will read from the stream of events given a streamId", async () => {
      const event = new TestEvent();
      event.streamId = faker.datatype.uuid();

      await store.appendToStream([event]);

      expect(await store.readFromStream(event.streamId)).toStrictEqual([event]);
    });
  });
});
