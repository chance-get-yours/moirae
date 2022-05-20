import { Type } from "class-transformer";
import { EventType } from "../interfaces/event-like.interface";
import { Eventable } from "./eventable.class";

export abstract class Event extends Eventable {
  @Type(() => Date)
  public readonly $timestamp: Date;
  public readonly $type = EventType.EVENT;

  constructor() {
    super();
    this.$timestamp = new Date();
  }
}
