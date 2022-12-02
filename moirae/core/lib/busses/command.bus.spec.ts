import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestCommand } from "../../testing-classes/test.command";
import { MemoryCache } from "../caches/memory.cache";
import { CommandResponse } from "../classes/command-response.class";
import { DomainStore } from "../classes/domain-store.class";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { CommandHandler } from "../decorators/command-handler.decorator";
import { MoiraeFilter } from "../decorators/moirae-filter.decorator";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandler } from "../interfaces/command-handler.interface";
import { ICommand } from "../interfaces/command.interface";
import { IMoiraeFilter } from "../interfaces/moirae-filter.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { MessengerService } from "../messenger/messenger.service";
import {
  CACHE_PROVIDER,
  COMMAND_PUBLISHER,
  DOMAIN_STORE,
  PUBLISHER_OPTIONS,
} from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { CommandBus } from "./command.bus";

class TestError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}

@CommandHandler(TestCommand)
class TestHandler implements ICommandHandler<TestCommand> {
  async execute(command: TestCommand): Promise<void> {
    const key = command.$name;
    Logger.log(key);
  }
}

@MoiraeFilter(TestError)
class TestFilter implements IMoiraeFilter<TestError> {
  catch(command: ICommand, error: TestError): void | Promise<void> {
    // pass
  }
}

describe("CommandBus", () => {
  let bus: CommandBus;
  let handler: TestHandler;
  let publisher: IPublisher;
  let sagaManager: SagaManager;
  let errorHandler: TestFilter;
  let store: DomainStore;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommandBus,
        Explorer,
        MessengerService,
        ObservableFactory,
        TestFilter,
        SagaManager,
        {
          provide: CACHE_PROVIDER,
          useClass: MemoryCache,
        },
        {
          provide: DOMAIN_STORE,
          useClass: DomainStore,
        },
        {
          provide: COMMAND_PUBLISHER,
          useClass: MemoryPublisher,
        },
        {
          provide: PUBLISHER_OPTIONS,
          useValue: {},
        },
        TestHandler,
      ],
    }).compile();

    bus = module.get(CommandBus);
    handler = module.get(TestHandler);
    publisher = bus["_publisher"];
    sagaManager = module.get(SagaManager);
    errorHandler = module.get(TestFilter);

    store = module.get(DOMAIN_STORE);

    await publisher["onApplicationBootstrap"]();
    sagaManager.onApplicationBootstrap();
    bus.onApplicationBootstrap();
  });

  it("will be defined", () => {
    expect(bus).toBeDefined();
  });

  describe("executeLocal", () => {
    it("will execute the handler", async () => {
      const command = new TestCommand();
      command.$executionDomain = faker.random.word();

      store.add(command.$executionDomain);

      const handlerSpy = jest.spyOn(handler, "execute");
      expect(await bus["executeLocal"](command)).toBeUndefined();

      expect(handlerSpy).toHaveBeenCalledWith(command, {
        streamId: command.STREAM_ID,
      });
    });

    it("will catch, log, and handle an error in execution", async () => {
      const command = new TestCommand();
      command.$correlationId = faker.datatype.uuid();

      jest.spyOn(handler, "execute").mockRejectedValue(new TestError());
      const errorSpy = jest.spyOn(errorHandler, "catch");
      await bus["executeLocal"](command);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("execute", () => {
    it("will call executeLocal on a local command and return a generic response", async () => {
      const command = new TestCommand();
      command.$executionDomain = faker.random.word();
      store.add(command.$executionDomain);

      const localSpy = jest.spyOn(bus, "executeLocal" as never);
      const publishSpy = jest.spyOn(publisher, "publish");

      expect(await bus.execute(command)).toBeInstanceOf(CommandResponse);
      expect(localSpy).toHaveBeenCalledWith(command);
      expect(publishSpy).not.toHaveBeenCalled();
    });

    it("will call IPublisher.publish for commands in a different domain", async () => {
      const publishSpy = jest.spyOn(publisher, "publish");
      const command = new TestCommand();
      command.$executionDomain = "hello world";

      expect(await bus.execute(command)).toBeInstanceOf(CommandResponse);

      command.$responseKey = expect.any(String);
      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...command,
          $correlationId: expect.any(String),
        }),
      );
    });
  });
});
