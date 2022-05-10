import { Test } from "@nestjs/testing";
import { TestEvent } from "../classes/aggregate-root.class.spec";
import { ConstructorStorage } from "../classes/constructor-storage.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IEvent } from "../interfaces/event.interface";
import { MemoryPublisher } from "./memory.publisher";

describe("MemoryPublisher", () => {
  let publisher: MemoryPublisher<IEvent>;

  beforeAll(() => {
    const instance = ConstructorStorage.getInstance();
    instance.set(TestEvent);
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MemoryPublisher, ObservableFactory],
    }).compile();

    publisher = await module.resolve(MemoryPublisher);
    await publisher.onModuleInit();
  });

  it("will be defined", () => {
    expect(publisher).toBeDefined();
  });

  describe("publish", () => {
    it("will serialize the event to JSON", async () => {
      const serializeSpy = jest.spyOn(publisher, "serializeEvent");

      await publisher.publish(new TestEvent());
      expect(serializeSpy).toHaveBeenCalledWith(new TestEvent());
    });

    it("will publish the event to the queue", async () => {
      const queueSpy = jest.spyOn(publisher["_queue"], "enqueue");

      await publisher.publish(new TestEvent());
      expect(queueSpy).toHaveBeenCalledWith(JSON.stringify(new TestEvent()));
    });

    it("will emit an event if it is the first element in the queue", async () => {
      const eeSpy = jest.spyOn(publisher["_ee"], "emit");

      publisher.subscribe(() => void 0);
      await publisher.publish(new TestEvent());
      expect(eeSpy).toHaveBeenCalledWith(
        publisher["_key"],
        publisher.serializeEvent(new TestEvent()),
      );
    });

    it("will not emit any events if there are no subscribers", async () => {
      const eeSpy = jest.spyOn(publisher["_ee"], "emit");

      await publisher.publish(new TestEvent());
      expect(eeSpy).not.toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    it("will call subscriber function", async () => {
      const sub = jest.fn();

      publisher.subscribe(sub);
      await publisher.publish(new TestEvent());
      expect(sub).toHaveBeenCalledWith(new TestEvent());
    });

    it("will allow unsubscribing", async () => {
      const sub = jest.fn();

      const subKey = publisher.subscribe(sub);
      await publisher.publish(new TestEvent());
      expect(sub).toHaveBeenCalledWith(new TestEvent());

      publisher.unsubscribe(subKey);
      await publisher.publish(new TestEvent());
      expect(sub).toHaveBeenCalledTimes(1);
    });
  });
});
