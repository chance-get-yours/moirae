import { Test } from "@nestjs/testing";
import { TestEvent } from "../../testing-classes/test.event";
import { ConstructorStorage } from "../classes/constructor-storage.class";
import { ObservableFactory } from "../factories/observable.factory";
import { IEvent } from "../interfaces/event.interface";
import { PUBLISHER_OPTIONS } from "../moirae.constants";
import { MemoryPublisher } from "./memory.publisher";

describe("MemoryPublisher", () => {
  let publisher: MemoryPublisher<IEvent>;

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeAll(() => {
    jest.useFakeTimers();
    const instance = ConstructorStorage.getInstance();
    instance.set(TestEvent);
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MemoryPublisher,
        ObservableFactory,
        { provide: PUBLISHER_OPTIONS, useValue: {} },
      ],
    }).compile();

    publisher = await module.resolve(MemoryPublisher);
    await publisher.onApplicationBootstrap();
  });

  it("will be defined", () => {
    expect(publisher).toBeDefined();
  });

  describe("publish", () => {
    it("will serialize the event to JSON", async () => {
      const serializeSpy = jest.spyOn(publisher, "serializeEvent");
      const evt = new TestEvent();

      await publisher.publish(evt);
      expect(serializeSpy).toHaveBeenCalledWith(evt);
    });

    it("will publish the event to the queue", async () => {
      const queueSpy = jest.spyOn(publisher["_queue"], "enqueue");
      const evt = new TestEvent();

      await publisher.publish(evt);
      expect(queueSpy).toHaveBeenCalledWith(JSON.stringify(evt));
    });

    it("will emit an event if it is the first element in the queue", async () => {
      const eeSpy = jest.spyOn(publisher["_distributor"], "publish");
      const evt = new TestEvent();

      publisher.subscribe(() => void 0);
      await publisher.publish(evt);
      expect(eeSpy).toHaveBeenCalledWith(evt);
    });

    it("will not emit any events if there are no subscribers", async () => {
      const eeSpy = jest.spyOn(publisher["_distributor"], "publish");

      await publisher.publish(new TestEvent());
      expect(eeSpy).not.toHaveBeenCalled();
    });
  });

  describe("subscribe", () => {
    it("will call subscriber function", async () => {
      const sub = jest.fn();
      const evt = new TestEvent();

      publisher.subscribe(sub);
      await publisher.publish(evt);
      expect(sub).toHaveBeenCalledWith(evt);
    });

    it("will allow unsubscribing", async () => {
      const sub = jest.fn();

      const subKey = publisher.subscribe(sub);
      const evt = new TestEvent();
      await publisher.publish(evt);
      expect(sub).toHaveBeenCalledWith(evt);

      publisher.unsubscribe(subKey);
      await publisher.publish(new TestEvent());
      expect(sub).toHaveBeenCalledTimes(1);
    });
  });
});
