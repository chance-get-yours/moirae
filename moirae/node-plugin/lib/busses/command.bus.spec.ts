import { faker } from "@faker-js/faker";
import {
  ICommandHandler,
  MemoryPublisher,
  MessengerService,
  ObservableFactory,
} from "@moirae/core";
import { TestCommand } from "../../testing-classes/test.command";
import { Container } from "../classes/container.class";
import { CommandBus } from "./command.bus";

class TestCommandHandler implements ICommandHandler<TestCommand> {
  execute(): Promise<void> {
    return Promise.resolve();
  }
}

describe("CommandBus", () => {
  let bus: CommandBus;
  let handler: TestCommandHandler;

  beforeEach(() => {
    handler = new TestCommandHandler();

    const container = new Container();
    container.register({
      command: TestCommand,
      instance: handler,
      role: "CommandHandler",
    });

    const factory = new ObservableFactory();

    bus = new CommandBus(
      container,
      new MessengerService(),
      factory,
      new MemoryPublisher(factory, {
        nodeId: faker.datatype.uuid(),
      }),
    );

    bus.onApplicationBootstrap();
  });

  it("will correctly register the handler", () => {
    expect(bus["_handlerMap"].get(TestCommand.name)).toEqual(handler);
  });

  it("will call TestCommandHandler.execute when running bus.executeLocal with a TestCommand", async () => {
    const command = new TestCommand();
    const handlerSpy = jest.spyOn(handler, "execute");

    await bus["executeLocal"](command);

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(handlerSpy).toHaveBeenCalledWith(command, {
      streamId: expect.any(String),
    });
  });
});
