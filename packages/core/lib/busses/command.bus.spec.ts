import { faker } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { TestCommand } from "../../testing-classes/test.command";
import { MemoryCache } from "../caches/memory.cache";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { CommandHandler } from "../decorators/command-handler.decorator";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandler } from "../interfaces/command-handler.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import {
  CACHE_PROVIDER,
  PUBLISHER,
  PUBLISHER_OPTIONS,
} from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { CommandBus } from "./command.bus";

@CommandHandler(TestCommand)
class TestHandler implements ICommandHandler<TestCommand> {
  async execute(command: TestCommand): Promise<string> {
    return "hello world";
  }
}

describe("CommandBus", () => {
  let bus: CommandBus;
  let handler: TestHandler;
  let publisher: IPublisher;
  let sagaManager: SagaManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommandBus,
        Explorer,
        ObservableFactory,
        SagaManager,
        {
          provide: CACHE_PROVIDER,
          useClass: MemoryCache,
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
      ],
    }).compile();

    bus = module.get(CommandBus);
    handler = module.get(TestHandler);
    publisher = bus["_publisher"];
    sagaManager = module.get(SagaManager);

    await publisher["onApplicationBootstrap"]();
    sagaManager.onApplicationBootstrap();
    bus.onApplicationBootstrap();
  });

  it("will be defined", () => {
    expect(bus).toBeDefined();
  });

  describe("executeLocal", () => {
    it("will execute the handler", async () => {
      expect(await bus["executeLocal"](new TestCommand())).toEqual(
        "hello world",
      );
    });

    it("will catch, log, and return an error in execution", async () => {
      const command = new TestCommand();
      command.$correlationId = faker.datatype.uuid();

      jest.spyOn(handler, "execute").mockRejectedValue(new Error());
      const rollbackSpy = jest.spyOn(sagaManager, "rollbackSagas");

      expect(await bus["executeLocal"](command)).toBeInstanceOf(Error);
      expect(rollbackSpy).toHaveBeenCalledWith(command.$correlationId);
    });
  });

  describe("execute", () => {
    it("will call executeLocal on command and return a response", async () => {
      const publishSpy = jest.spyOn(publisher, "publish");
      const command = new TestCommand();

      expect(await bus.execute(command)).toEqual("hello world");

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
