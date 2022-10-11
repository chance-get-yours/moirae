import { EventType } from "../interfaces/event-like.interface";
import { Eventable } from "./eventable.class";

export abstract class Command extends Eventable {
  public $correlationId: string;
  public $executionDomain: "default" | string;
  public readonly $type = EventType.COMMAND;
}
