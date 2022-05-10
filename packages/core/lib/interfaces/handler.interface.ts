import { IEventLike } from "./event-like.interface";

export interface IHandler<T extends IEventLike> {
  execute(event: T): Promise<unknown>;
}
