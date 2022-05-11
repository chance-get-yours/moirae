import { faker } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { TestAggregate, TestEvent } from "../classes/aggregate-root.class.spec";
import { IEventSource } from "../interfaces/event-source.interface";
import { EVENT_SOURCE } from "../moirae.constants";
import { AggregateFactory } from "./aggregate.factory";

describe("AggregateFactory", () => {
  let eventSource: IEventSource;
  let factory: AggregateFactory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AggregateFactory,
        {
          provide: EVENT_SOURCE,
          useFactory: () => ({
            appendToStream: jest.fn(),
            readFromStream: jest.fn(),
          }),
        },
      ],
    }).compile();

    eventSource = module.get(EVENT_SOURCE);
    factory = module.get(AggregateFactory);
  });

  it("will be defined", () => {
    expect(factory).toBeDefined();
  });

  describe("mergeContext", () => {
    it("will populate the aggregate with events from the database", async () => {
      const persistedEvent = new TestEvent();
      persistedEvent.streamId = faker.datatype.uuid();

      jest
        .spyOn(eventSource, "readFromStream")
        .mockResolvedValue([persistedEvent]);

      const aggregate = await factory.mergeContext(
        persistedEvent.streamId,
        TestAggregate,
      );

      expect(aggregate).toBeInstanceOf(TestAggregate);
      expect(aggregate.eventHistory).toHaveLength(1);
      expect(aggregate.uncommittedEventHistory).toHaveLength(0);
      expect(aggregate.foo).toEqual(persistedEvent.data.foo);
    });

    it("will set a function to commit the aggregate", async () => {
      const event = new TestEvent();
      event.streamId = faker.datatype.uuid();

      jest.spyOn(eventSource, "readFromStream").mockResolvedValue([]);
      const saveSpy = jest
        .spyOn(eventSource, "appendToStream")
        .mockResolvedValue([event]);

      const aggregate = await factory.mergeContext(
        event.streamId,
        TestAggregate,
      );

      expect(aggregate).toBeInstanceOf(TestAggregate);
      expect(aggregate.eventHistory).toHaveLength(0);
      expect(aggregate.uncommittedEventHistory).toHaveLength(0);

      aggregate.apply(event);

      expect(aggregate.foo).toEqual(event.data.foo);
      expect(aggregate.eventHistory).toHaveLength(1);
      expect(aggregate.uncommittedEventHistory).toHaveLength(1);

      await aggregate.commit();

      expect(saveSpy).toHaveBeenCalledWith([event]);
    });
  });
});
