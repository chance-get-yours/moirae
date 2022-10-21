import { IEventLike } from "./event-like.interface";

export interface IEvent<T = unknown> extends IEventLike {
  /**
   * UUID related to a single "transaction" within the system, passed
   * from commands to events to commands etc...
   */
  $correlationId?: string;
  /**
   * Body of the event containing all relevant data updates
   */
  $data: T;
  /**
   * Stream ID the event belongs to
   */
  $streamId: string;
  /**
   * Timestamp event was created
   */
  $timestamp: Date;
}
