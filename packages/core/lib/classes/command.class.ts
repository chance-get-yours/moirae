import { EventType } from "../interfaces/event-like.interface";
import { Eventable } from "./eventable.class";

export abstract class Command extends Eventable {
  public readonly type = EventType.COMMAND;
}
