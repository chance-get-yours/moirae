export enum EventType {
  COMMAND = "COMMAND",
  EVENT = "EVENT",
  QUERY = "QUERY",
}

export interface IEventLike {
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
