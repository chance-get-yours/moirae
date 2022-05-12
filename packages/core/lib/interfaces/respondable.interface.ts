import { IEventLike } from "./event-like.interface";

export interface Respondable extends IEventLike {
  /**
   * System property to disable response processing if command
   * was triggered from a saga.
   */
  disableResponse?: boolean;
  /**
   * System property for a unique identifier for the requesting system. Used in routing
   * responses back from other machines.
   */
  responseKey?: string;
}
