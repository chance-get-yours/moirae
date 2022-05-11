import { IEventLike } from "./event-like.interface";

export interface IEvent extends Pick<IEventLike, "name" | "type" | "version"> {
  streamId: string;
}
