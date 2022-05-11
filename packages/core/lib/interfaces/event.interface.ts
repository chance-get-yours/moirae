import { IEventLike } from "./event-like.interface";

export interface IEvent<T = unknown> extends IEventLike {
  /**
   * Body of the event containing all relevant data updates
   */
  data: T;
  /**
   * Stream ID the event belongs to
   */
  streamId: string;
  /**
   * Timestamp event was created
   */
  timestamp: Date;
}
