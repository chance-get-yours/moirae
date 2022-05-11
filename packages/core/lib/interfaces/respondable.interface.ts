import { IEventLike } from "./event-like.interface";

export interface Respondable extends IEventLike {
  /**
   * System property for a unique identifier for the requesting system. Used in routing
   * responses back from other machines.
   */
  responseKey?: string;
}
