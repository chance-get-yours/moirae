import { Type } from "class-transformer";
import { EventType } from "../interfaces/event-like.interface";
import { IRequestMetadata } from "../interfaces/request-metadata.interface";
import { Eventable } from "./eventable.class";

export abstract class Event extends Eventable {
  public $correlationId: string;
  @Type(() => Date)
  public readonly $timestamp: Date;
  public readonly $type = EventType.EVENT;

  constructor(metadata: IRequestMetadata = {}) {
    super(metadata);
    this.$timestamp = new Date();
  }
}
