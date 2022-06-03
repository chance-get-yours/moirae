import { Event } from "../lib/classes/event.class";
import { RegisterType } from "../lib/decorators/register-type.decorator";
import { IEvent } from "../lib/interfaces/event.interface";

export interface ITestEntity {
  foo: string;
}

@RegisterType()
export class TestEvent extends Event implements IEvent<ITestEntity> {
  public $streamId = "12345";
  public readonly $version: number = 1;
  public readonly $data: ITestEntity = { foo: "bar" };
}
