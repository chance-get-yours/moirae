import { IEventLike } from "./event-like.interface";

export interface Respondable extends IEventLike {
  /**
   * System property to disable response processing if command
   * was triggered from a saga.
   */
  $disableResponse?: boolean;
  /**
   * Unique key to associate a response to a request
   */
  $responseKey?: string;
  /**
   * System property to defined the requesting system
   */
  $routingKey?: string;
}
