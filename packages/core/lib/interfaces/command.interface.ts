import { IEventLike } from "./event-like.interface";

export interface ICommand extends IEventLike {
  disableResponse?: boolean;
  responseKey?: string;
}
