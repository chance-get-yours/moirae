import { IEventLike } from "./event-like.interface";

export interface IEvent extends IEventLike {
  streamId: string;
}
