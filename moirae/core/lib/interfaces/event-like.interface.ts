import { IRequestMetadata } from "./request-metadata.interface";

export enum EventType {
  COMMAND = "COMMAND",
  EVENT = "EVENT",
  QUERY = "QUERY",
}

export interface IEventLike {
  /**
   * Object containing metadata about the initiating request
   */
  $metadata?: IRequestMetadata;
  /**
   * Event name. Defaults to the name of the constructor
   */
  readonly $name: string;
  readonly $type: EventType;
  /**
   * Event revision version
   */
  readonly $version: number;
  /**
   * UUID to individually identify an event
   */
  readonly $uuid: string;
}
