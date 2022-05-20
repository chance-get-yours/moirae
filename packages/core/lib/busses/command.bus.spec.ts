import { Test } from "@nestjs/testing";
import { Command } from "../classes/command.class";
import { CommandHandler } from "../decorators/command-handler.decorator";
import { RegisterType } from "../decorators/register-type.decorator";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandler } from "../interfaces/command-handler.interface";
import { ICommand } from "../interfaces/command.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { PUBLISHER, PUBLISHER_OPTIONS } from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { CommandBus } from "./command.bus";

@RegisterType()
export class TestCommand extends Command implements ICommand {
  public $version = 1;
  $responseKey = "hello";
  $routingKey = "world";
}

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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommandBus,
        ObservableFactory,
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

    await publisher.onApplicationBootstrap();
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
      jest.spyOn(handler, "execute").mockRejectedValue(new Error());
      expect(await bus["executeLocal"](new TestCommand())).toBeInstanceOf(
        Error,
      );
    });
  });

  describe("execute", () => {
    it("will call executeLocal on command and return a response", async () => {
      const publishSpy = jest.spyOn(publisher, "publish");
      const command = new TestCommand();

      expect(await bus.execute(command)).toEqual("hello world");

      command.$responseKey = expect.any(String);
      expect(publishSpy).toHaveBeenCalledWith(command);
    });
  });
});
