import { Event } from "../lib/classes/event.class";
import { RegisterType } from "../lib/decorators/register-type.decorator";
import { IEvent } from "../lib/interfaces/event.interface";

@RegisterType()
export class MakeDynamicEvent extends Event implements IEvent {
  public $streamId = "12345";
  public readonly $version: number = 1;
  public readonly $data = {};
}
