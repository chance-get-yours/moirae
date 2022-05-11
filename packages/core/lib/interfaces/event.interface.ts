import { IEventLike } from "./event-like.interface";

export interface IEvent<T = unknown>
  extends Pick<IEventLike, "name" | "type" | "version"> {
  data: T;
  streamId: string;
  timestamp: Date;
}
