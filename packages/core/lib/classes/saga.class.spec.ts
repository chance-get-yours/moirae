import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestCommand } from "../busses/command.bus.spec";
import { SagaStep } from "../decorators/saga-step.decorator";
import { IEvent } from "../interfaces/event.interface";
import { IRollbackCommand } from "../interfaces/rollback-command.interface";
import { TestEvent } from "./aggregate-root.class.spec";
import { Command } from "./command.class";
import { Event } from "./event.class";
import { Saga } from "./saga.class";

class UnhandledEvent extends Event implements IEvent {
  $streamId = "123456789";
  $version = 1;
  $data = {};
}

export class TestRollbackCommand extends Command implements IRollbackCommand {
  public readonly $data: { streamId: string; correlationId: string };
  public $version = 1;

  constructor(streamId: string, correlationId: string) {
    super();
    this.$data = { streamId, correlationId };
  }
}

@Injectable()
class TestSaga extends Saga {
  @SagaStep(TestEvent, TestRollbackCommand)
  handleTestEvent(event: TestEvent) {
    return [new TestCommand()];
  }
}

describe("Saga", () => {
  let saga: TestSaga;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TestSaga],
    }).compile();

    saga = module.get(TestSaga);
    saga.onApplicationBootstrap();
  });

  it("will be defined", () => {
    expect(saga).toBeDefined();
  });

  describe("process", () => {
    it("will return a test command given a test event", () => {
      const event = new TestEvent();
      expect(saga.process(event)).toMatchObject([expect.any(TestCommand)]);
    });

    it("will return an empty array given an unhandled event", () => {
      const event = new UnhandledEvent();
      expect(saga.process(event)).toMatchObject([]);
    });
  });

  describe("rollback", () => {
    it("will emit a TestRollbackCommand for the correlationId", () => {
      const event = new TestEvent();
      event.$correlationId = faker.datatype.uuid();
      saga.process(event);

      expect(saga.rollback(event.$correlationId)).toMatchObject([
        expect.objectContaining({
          $data: {
            correlationId: event.$correlationId,
            streamId: event.$streamId,
          },
          $name: TestRollbackCommand.name,
        }),
      ]);
    });
  });
});
