export enum EventType {
  COMMAND = "COMMAND",
  EVENT = "EVENT",
  QUERY = "QUERY",
}

export interface IEventLike {
  readonly name: string;
  readonly type: EventType;
  readonly version: number;
}
