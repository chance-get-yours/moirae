import { IEventLike } from "./event-like.interface";

export interface IQuery extends IEventLike {
  responseKey?: string;
}
