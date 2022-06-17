import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { randomUUID } from "crypto";
import { TestCommand } from "../../testing-classes/test.command";
import { TestEvent } from "../../testing-classes/test.event";
import { MemoryCache } from "../caches/memory.cache";
import { Event } from "../classes/event.class";
import { SagaManager } from "../classes/saga-manager.class";
import { Saga } from "../classes/saga.class";
import { TestRollbackCommand } from "../classes/saga.class.spec";
import { EventHandler } from "../decorators/event-handler.decorator";
import { RegisterType } from "../decorators/register-type.decorator";
import { SagaStep } from "../decorators/saga-step.decorator";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventHandler } from "../interfaces/event-handler.interface";
import { IEventSource } from "../interfaces/event-source.interface";
import { IEvent } from "../interfaces/event.interface";
import {
  CACHE_PROVIDER,
  EVENT_PUBSUB_ENGINE,
  EVENT_SOURCE,
  PUBLISHER,
  PUBLISHER_OPTIONS,
} from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { MemoryStore } from "../stores/memory.store";
import { CommandBus } from "./command.bus";
import { EventBus } from "./event.bus";

@EventHandler(TestEvent)
class TestHandler implements IEventHandler<TestEvent> {
  async execute(event: TestEvent): Promise<unknown> {
    return "hello world";
  }
}

@Injectable()
class TestSaga extends Saga {
  @SagaStep(TestEvent, TestRollbackCommand)
  public onTestEvent(event: TestEvent) {
    return [new TestCommand()];
  }

  dummyFn() {
    return undefined;
  }
}

describe("EventBus", () => {
  let bus: EventBus;
  let commandBus: CommandBus;
  let handler: TestHandler;
  let source: IEventSource;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommandBus,
        EventBus,
        ObservableFactory,
        SagaManager,
        {
          provide: CACHE_PROVIDER,
          useClass: MemoryCache,
        },
        {
          provide: EVENT_SOURCE,
          useClass: MemoryStore,
        },
        {
          provide: PUBLISHER,
          useClass: MemoryPublisher,
        },
        {
          provide: PUBLISHER_OPTIONS,
          useValue: {},
        },
        {
          provide: EVENT_PUBSUB_ENGINE,
          useFactory: (factory: ObservableFactory) =>
            factory.generateDistributor(randomUUID()),
          inject: [ObservableFactory],
        },
        TestHandler,
        TestSaga,
      ],
    }).compile();

    bus = module.get(EventBus);
    commandBus = module.get(CommandBus);
    handler = module.get(TestHandler);
    source = bus["eventSource"];

    await source["onApplicationBootstrap"]();
    await commandBus["_publisher"]["onApplicationBootstrap"]();
    module.get(SagaManager).onApplicationBootstrap();
    bus.onApplicationBootstrap();
    module.get(TestSaga).onApplicationBootstrap();
  });

  it("will be defined", () => {
    expect(bus).toBeDefined();
  });

  describe("executeLocal", () => {
    it("will execute the handler if exists", async () => {
      const handlerSpy = jest.spyOn(handler, "execute");
      const event = new TestEvent();

      await bus["executeLocal"](event);
      expect(handlerSpy).toHaveBeenCalledWith(event);
    });

    it("will not throw an error if handler does not exist", async () => {
      @RegisterType()
      class UnhandledEvent extends Event implements IEvent {
        $streamId = "123456789";
        $version = 1;
        $data = {};
      }
      const handlerSpy = jest.spyOn(handler, "execute");

      await bus["executeLocal"](new UnhandledEvent());
      expect(handlerSpy).not.toHaveBeenCalled();
    });

    it("will publish commands created from sagas", async () => {
      const commandSpy = jest.spyOn(commandBus, "publish");

      await bus["executeLocal"](new TestEvent());
      expect(commandSpy).toHaveBeenCalledWith(expect.any(TestCommand));
    });

    it("will pass the event correlationId to the commands", async () => {
      const commandSpy = jest.spyOn(commandBus, "publish");
      const event = new TestEvent();
      event.$correlationId = faker.datatype.uuid();

      await bus["executeLocal"](event);
      expect(commandSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          $correlationId: event.$correlationId,
        }),
      );
    });

    it("will catch an error in a handler and initialize a rollback", async () => {
      const initialEvent = new TestEvent();
      initialEvent.$correlationId = faker.datatype.uuid();
      await bus["executeLocal"](initialEvent);

      jest.spyOn(handler, "execute").mockRejectedValue(new Error());
      const commandSpy = jest.spyOn(commandBus, "publish");

      const failureEvent = new TestEvent();
      failureEvent.$correlationId = initialEvent.$correlationId;
      await bus["executeLocal"](failureEvent);
      expect(commandSpy).toHaveBeenCalledWith(expect.any(TestRollbackCommand));
    });
  });
});
