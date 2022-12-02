import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestCommand } from "../../testing-classes/test.command";
import { TestEvent } from "../../testing-classes/test.event";
import { MemoryCache } from "../caches/memory.cache";
import { RegisterType } from "../decorators/register-type.decorator";
import { SagaStep } from "../decorators/saga-step.decorator";
import { IEvent } from "../interfaces/event.interface";
import { IRollbackCommand } from "../interfaces/rollback-command.interface";
import { Command } from "./command.class";
import { Event } from "./event.class";
import { Saga } from "./saga.class";

class UnhandledEvent extends Event implements IEvent {
  $streamId = "123456789";
  $version = 1;
  $data = {};
}

@RegisterType()
export class TestRollbackCommand extends Command implements IRollbackCommand {
  public readonly $data: { streamId: string; correlationId: string };
  public $version = 1;

  public get STREAM_ID() {
    return this.$data.streamId;
  }

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
      providers: [TestSaga, MemoryCache],
    }).compile();

    saga = module.get(TestSaga);
    saga.onApplicationBootstrap();
    saga["_cacheController"] = module.get(MemoryCache);
  });

  it("will be defined", () => {
    expect(saga).toBeDefined();
  });

  describe("process", () => {
    it("will return a test command given a test event", async () => {
      const event = new TestEvent();
      expect(await saga.process(event)).toMatchObject([
        expect.any(TestCommand),
      ]);
    });

    it("will return an empty array given an unhandled event", async () => {
      const event = new UnhandledEvent();
      expect(await saga.process(event)).toMatchObject([]);
    });
  });
});
