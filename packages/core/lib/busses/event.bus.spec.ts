import { Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestEvent } from "../classes/aggregate-root.class.spec";
import { Event } from "../classes/event.class";
import { EventHandler } from "../decorators/event-handler.decorator";
import { RegisterType } from "../decorators/register-type.decorator";
import { Saga } from "../decorators/saga.decorator";
import { ObservableFactory } from "../factories/observable.factory";
import { IEventHandler } from "../interfaces/event-handler.interface";
import { IEventSource } from "../interfaces/event-source.interface";
import { IEvent } from "../interfaces/event.interface";
import { SagaHandler } from "../interfaces/saga-handler.interface";
import {
  EVENT_SOURCE,
  PUBLISHER,
  PUBLISHER_OPTIONS,
} from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { MemoryStore } from "../stores/memory.store";
import { CommandBus } from "./command.bus";
import { TestCommand } from "./command.bus.spec";
import { EventBus } from "./event.bus";

@EventHandler(TestEvent)
class TestHandler implements IEventHandler<TestEvent> {
  async execute(event: TestEvent): Promise<unknown> {
    return "hello world";
  }
}

@Injectable()
class TestSaga {
  @Saga()
  testSaga: SagaHandler = (event: IEvent) => {
    if (event instanceof TestEvent) {
      return [new TestCommand()];
    }
  };

  dummyFn = () => undefined;
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
        TestHandler,
        TestSaga,
      ],
    }).compile();

    bus = module.get(EventBus);
    commandBus = module.get(CommandBus);
    handler = module.get(TestHandler);
    source = bus["eventSource"];

    await source.onApplicationBootstrap();
    await commandBus["_publisher"].onApplicationBootstrap();
    bus.onApplicationBootstrap();
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
        streamId = "123456789";
        version = 1;
        data = {};
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

    it("will catch an error in a handler and still run sagas", async () => {
      jest.spyOn(handler, "execute").mockRejectedValue(new Error());
      const commandSpy = jest.spyOn(commandBus, "publish");

      await bus["executeLocal"](new TestEvent());
      expect(commandSpy).toHaveBeenCalledWith(expect.any(TestCommand));
    });
  });
});
