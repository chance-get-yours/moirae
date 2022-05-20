import {
  Event,
  IEvent,
  IPublisher,
  MemoryPublisher,
  ObservableFactory,
  PUBLISHER,
  PUBLISHER_OPTIONS,
  RegisterType,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { instanceToPlain } from "class-transformer";
import { EventStore } from "../entities/event-store.entity";
import { createMockRepository } from "../testing/createMockRepository";
import { TypeORMStore } from "./typeorm.store";

@RegisterType()
export class TestEvent extends Event implements IEvent {
  public $streamId = "12345";
  public readonly $version: number = 1;
  public readonly $data = {};
}

describe("TypeORMStore", () => {
  let publisher: IPublisher;
  const repository: Record<string, jest.Mock> = createMockRepository();
  let store: TypeORMStore;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TypeORMStore,
        ObservableFactory,
        {
          provide: PUBLISHER,
          useClass: MemoryPublisher,
        },
        {
          provide: PUBLISHER_OPTIONS,
          useValue: {},
        },
        {
          provide: getRepositoryToken(EventStore),
          useValue: repository,
        },
      ],
    }).compile();

    store = module.get(TypeORMStore);
    publisher = store["publisher"];
    await publisher["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(store).toBeDefined();
  });

  describe("appendToStream", () => {
    it("will save events to the db", async () => {
      const events = [new TestEvent()];
      const plainEvents = events.map((event) => instanceToPlain(event));
      repository.save.mockResolvedValue(plainEvents);

      expect(await store.appendToStream(events)).toEqual(events);
      expect(repository.save).toHaveBeenCalledWith(plainEvents);
    });

    it("will publish the events", async () => {
      const events = [new TestEvent()];
      const plainEvents = events.map((event) => instanceToPlain(event));
      repository.save.mockResolvedValue(plainEvents);
      const pubSpy = jest.spyOn(publisher, "publish");

      expect(await store.appendToStream(events)).toEqual(events);
      events.forEach((event) => {
        expect(pubSpy).toHaveBeenCalledWith(event);
      });
    });
  });

  describe("readFromStream", () => {
    it("will pull from the db in order", async () => {
      const events = [new TestEvent()];
      repository.find.mockResolvedValue(events);

      expect(await store.readFromStream(events[0].$streamId)).toEqual(events);
      expect(repository.find).toHaveBeenCalledWith({
        where: { $streamId: events[0].$streamId },
        order: { $order: "ASC" },
      });
    });
  });
});
