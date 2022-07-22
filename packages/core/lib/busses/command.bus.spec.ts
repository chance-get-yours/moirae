import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestCommand } from "../../testing-classes/test.command";
import { MemoryCache } from "../caches/memory.cache";
import { CommandResponse } from "../classes/command-response.class";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { CommandHandler } from "../decorators/command-handler.decorator";
import { RegisterType } from "../decorators/register-type.decorator";
import { CommandExecutionError } from "../exceptions/command-execution.error";
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

@RegisterType()
class RegisteredError extends Error {
  constructor() {
    super("This is an error");
    this.name = this.constructor.name;
  }
}

class UnregisteredError extends Error {
  constructor() {
    super("This is an unregistered error");
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
      const handlerSpy = jest.spyOn(handler, "execute");
      await bus["executeLocal"](new TestCommand());
      expect(handlerSpy).toHaveBeenCalledWith(expect.any(TestCommand), {
        streamId: new TestCommand().STREAM_ID,
      });
    });

    it("will catch, log, and return an error in execution", async () => {
      const command = new TestCommand();
      command.$correlationId = faker.datatype.uuid();

      jest.spyOn(handler, "execute").mockRejectedValue(new Error());
      const rollbackSpy = jest.spyOn(sagaManager, "rollbackSagas");

      const response = await bus["executeLocal"](command);
      expect(response.error).toBeInstanceOf(Error);
      expect(rollbackSpy).toHaveBeenCalledWith(command.$correlationId);
    });
  });

  describe("execute", () => {
    it("will call executeLocal on command and return a response", async () => {
      const publishSpy = jest.spyOn(publisher, "publish");
      const command = new TestCommand();

      expect(await bus.execute(command)).toBeInstanceOf(CommandResponse);

      command.$responseKey = expect.any(String);
      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...command,
          $correlationId: expect.any(String),
        }),
      );
    });

    it("will handle an error that is registered", async () => {
      jest.spyOn(handler, "execute").mockRejectedValue(new RegisteredError());

      const command = new TestCommand();

      await expect(() =>
        bus.execute(command, { throwError: true }),
      ).rejects.toBeInstanceOf(RegisteredError);
    });

    it("will handle an error that is unregistered", async () => {
      jest.spyOn(handler, "execute").mockRejectedValue(new UnregisteredError());

      const command = new TestCommand();

      await expect(() =>
        bus.execute(command, { throwError: true }),
      ).rejects.toBeInstanceOf(CommandExecutionError);
    });
  });
});
