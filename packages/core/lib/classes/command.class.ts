import { EventType } from "../interfaces/event-like.interface";
import { Eventable } from "./eventable.class";

export abstract class Command extends Eventable {
  public $correlationId: string;
  public $responseKey: string;
  public $routingKey: string;
  public readonly $type = EventType.COMMAND;
}
