import { faker } from "@faker-js/faker";
import "reflect-metadata";
import { Apply } from "../decorators/apply.decorator";
import { RegisterType } from "../decorators/register-type.decorator";
import { Rollback } from "../decorators/rollback.decorator";
import { UnavailableCommitError } from "../exceptions/commit-unavailable.error";
import { InvalidMultipleSetError } from "../exceptions/invalid-mutliple-set.error";
import { UnhandledEventError } from "../exceptions/unhandled-event.error";
import { IEvent } from "../interfaces/event.interface";
import { AggregateRoot } from "./aggregate-root.class";
import { Event } from "./event.class";

export interface ITestEntity {
  foo: string;
}

@RegisterType()
export class TestEvent extends Event implements IEvent<ITestEntity> {
  public $streamId = "12345";
  public readonly $version: number = 1;
  public readonly $data: ITestEntity = { foo: "bar" };
}

@RegisterType()
class OtherTestEvent extends Event implements IEvent<ITestEntity> {
  public $streamId = "12345";
  public readonly $version: number = 1;
  public readonly $data: ITestEntity = { foo: "baz" };
}

@RegisterType()
class RollbackOtherTestEvent extends Event implements IEvent<ITestEntity> {
  public $streamId = "12345";
  public readonly $version: number = 1;
  public $data: ITestEntity;
}

export class TestAggregate
  extends AggregateRoot<ITestEntity>
  implements ITestEntity
{
  public foo: string;

  @Apply(TestEvent)
  protected onTestEvent(event: TestEvent): void {
    this.foo = event.$data.foo;
  }

  @Apply(OtherTestEvent)
  protected onOtherTestEvent(event: OtherTestEvent): void {
    this.foo = event.$data.foo;
  }

  @Rollback(OtherTestEvent)
  protected createRollbackOtherTestEvent(
    event: OtherTestEvent,
  ): RollbackOtherTestEvent {
    const aggregate = this.getAggregatePriorTo<TestAggregate>(event);
    const rollbackEvent = new RollbackOtherTestEvent();
    rollbackEvent.$data = { foo: aggregate.foo };
    return rollbackEvent;
  }

  @Apply(RollbackOtherTestEvent)
  protected onRollbackOtherTestEvent(event: RollbackOtherTestEvent): void {
    this.foo = event.$data.foo;
  }
}

describe("AggregateRoot", () => {
  let testAggregate: TestAggregate;

  beforeEach(() => {
    testAggregate = new TestAggregate(faker.datatype.uuid());
  });

  it("will apply events to the aggregate", () => {
    expect(testAggregate.foo).not.toBeDefined();

    testAggregate.apply(new TestEvent());

    expect(testAggregate.foo).toEqual("bar");
  });

  it("will store a history of events applied to the aggregate", () => {
    expect(testAggregate.eventHistory).toHaveLength(0);

    testAggregate.apply(new TestEvent());

    expect(testAggregate.eventHistory).toHaveLength(1);
    expect(testAggregate.eventHistory[0]).toBeInstanceOf(TestEvent);

    expect(testAggregate.uncommittedEventHistory).toHaveLength(1);
    expect(testAggregate.uncommittedEventHistory[0]).toBeInstanceOf(TestEvent);
  });

  it("will mark track events not yet committed to the database", () => {
    expect(testAggregate.eventHistory).toHaveLength(0);

    testAggregate.apply(new TestEvent(), true);

    expect(testAggregate.eventHistory).toHaveLength(1);

    testAggregate.apply(new TestEvent());

    expect(testAggregate.eventHistory).toHaveLength(2);
    expect(testAggregate.uncommittedEventHistory).toHaveLength(1);
    expect(testAggregate.uncommittedEventHistory[0]).toBeInstanceOf(TestEvent);
  });

  it("will throw an unhandled error if no handler is defined", () => {
    class ErrorEvent extends TestEvent {}

    expect(() => testAggregate.apply(new ErrorEvent())).toThrowError(
      UnhandledEventError,
    );
  });

  describe("commit", () => {
    let commitFn: jest.Mock;

    beforeEach(() => {
      commitFn = jest.fn();
      testAggregate.setCommitFunction(commitFn);
    });

    it("will call the commitFn on commit with the event history", async () => {
      const event = new TestEvent();
      testAggregate.apply(event);

      await testAggregate.commit();

      expect(commitFn).toHaveBeenCalledWith([event]);
    });

    it("will throw a multiple set error if attempting to set the commitFn more than once", () => {
      expect(() => testAggregate.setCommitFunction(jest.fn())).toThrowError(
        InvalidMultipleSetError,
      );
    });

    it("will throw an invalid commit error if the commit fn is not set", async () => {
      const event = new TestEvent();
      testAggregate.apply(event);
      testAggregate["_commitFn"] = undefined;

      await expect(() => testAggregate.commit()).rejects.toThrowError(
        UnavailableCommitError,
      );
    });
  });

  describe("rollback", () => {
    let correlationId: string;
    beforeEach(() => {
      const testEvent = new TestEvent();
      testEvent.$correlationId = faker.datatype.uuid();

      const otherTestEvent = new OtherTestEvent();
      otherTestEvent.$correlationId = faker.datatype.uuid();

      correlationId = otherTestEvent.$correlationId;

      testAggregate.apply(testEvent);
      testAggregate.apply(otherTestEvent);
    });

    it("will apply compensating events for the given correlationId", () => {
      expect(testAggregate.rollback(correlationId)).toEqual(1);
      expect(testAggregate.foo).toEqual("bar");
    });
  });
});
