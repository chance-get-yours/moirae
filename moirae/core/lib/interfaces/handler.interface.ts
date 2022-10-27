import { IEventLike } from "./event-like.interface";

export interface IHandler<T extends IEventLike, R = unknown> {
  execute(event: T): Promise<R>;
  execute(event: T, options: Record<string, unknown>): Promise<R>;
}
