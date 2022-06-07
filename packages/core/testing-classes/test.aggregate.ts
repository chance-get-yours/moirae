import { AggregateRoot } from "../lib/classes/aggregate-root.class";
import { Apply } from "../lib/decorators/apply.decorator";
import { Rollback } from "../lib/decorators/rollback.decorator";
import { OtherTestEvent } from "./other-test.event";
import { RollbackOtherTestEvent } from "./rollback-other-test.event";
import { ITestEntity, TestEvent } from "./test.event";

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
