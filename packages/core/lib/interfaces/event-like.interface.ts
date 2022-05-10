export enum EventType {
  COMMAND = "COMMAND",
  EVENT = "EVENT",
  QUERY = "QUERY",
}

export interface IEventLike {
  disableResponse?: boolean;
  readonly name: string;
  responseKey?: string;
  readonly type: EventType;
  readonly version: number;
}
