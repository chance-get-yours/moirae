import { faker } from "@faker-js/faker";
import "reflect-metadata";
import { MakeDynamicEvent } from "../../testing-classes/make-dynamic.event";
import { OtherTestEvent } from "../../testing-classes/other-test.event";
import { TestAggregate } from "../../testing-classes/test.aggregate";
import { TestCommand } from "../../testing-classes/test.command";
import { TestEvent } from "../../testing-classes/test.event";
import { ThirdTestEvent } from "../../testing-classes/third-test.event";
import { AggregateDeletedError } from "../exceptions/aggregate-deleted.error";
import { UnavailableCommitError } from "../exceptions/commit-unavailable.error";
import { InvalidMultipleSetError } from "../exceptions/invalid-mutliple-set.error";
import { UnhandledEventError } from "../exceptions/unhandled-event.error";

describe("AggregateRoot", () => {
  let testAggregate: TestAggregate;

  beforeEach(() => {
    testAggregate = new TestAggregate(faker.datatype.uuid());
  });

  describe("apply", () => {
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
      expect(testAggregate.uncommittedEventHistory[0]).toBeInstanceOf(
        TestEvent,
      );
    });

    it("will mark track events not yet committed to the database", () => {
      expect(testAggregate.eventHistory).toHaveLength(0);

      testAggregate.apply(new TestEvent(), true);

      expect(testAggregate.eventHistory).toHaveLength(1);

      testAggregate.apply(new TestEvent());

      expect(testAggregate.eventHistory).toHaveLength(2);
      expect(testAggregate.uncommittedEventHistory).toHaveLength(1);
      expect(testAggregate.uncommittedEventHistory[0]).toBeInstanceOf(
        TestEvent,
      );
    });

    it("will throw an unhandled error if no handler is defined", () => {
      class ErrorEvent extends TestEvent {}

      expect(() => testAggregate.apply(new ErrorEvent())).toThrowError(
        UnhandledEventError,
      );
    });

    it("will throw an AggregateDeletedError if an event is applied normally but the aggregate is deleted", () => {
      testAggregate.deleted = true;

      expect(() => testAggregate.apply(new TestEvent())).toThrowError(
        AggregateDeletedError,
      );
    });

    it("will not throw an AggregateDeletedError if applied from history", () => {
      testAggregate.deleted = true;

      expect(() =>
        testAggregate.apply(new TestEvent(), true),
      ).not.toThrowError();
    });
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

    it("will pass the correlationId if it exists", async () => {
      const event = new TestEvent();
      const command = new TestCommand();
      command.$correlationId = faker.datatype.uuid();

      testAggregate.apply(event);
      await testAggregate.commit(command);

      expect(commitFn).toHaveBeenCalledWith([
        expect.objectContaining({
          ...event,
          $correlationId: command.$correlationId,
        }),
      ]);
    });

    it("will pass metadata if it exists", async () => {
      const metadata = { hello: "world" };
      const event = new TestEvent();
      const command = new TestCommand(metadata);

      testAggregate.apply(event);
      await testAggregate.commit(command);

      expect(commitFn).toHaveBeenCalledWith([
        expect.objectContaining({
          ...event,
          $metadata: metadata,
        }),
      ]);
    });
  });

  describe("dynamic aggregates", () => {
    let thirdTest: ThirdTestEvent;

    beforeEach(() => {
      thirdTest = new ThirdTestEvent();
    });

    it("will throw a handler not found error for ThirdTestEvent initially", () => {
      expect(() => testAggregate.apply(thirdTest)).toThrowError();
    });

    it("will apply a MakeDynamicEvent and then handle a ThirdTestEvent", () => {
      testAggregate.apply(new MakeDynamicEvent());
      testAggregate.apply(thirdTest);
      expect(testAggregate.foo).toEqual(thirdTest.$data.foo);
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
