import { EventType } from "../interfaces/event-like.interface";
import { Eventable } from "./eventable.class";

export abstract class Query extends Eventable {
  public readonly $type = EventType.QUERY;
  public $executionDomain: "default" | string;
  public $responseKey: string;
  public $routingKey: string;
}
