import { OnApplicationBootstrap } from "@nestjs/common";
import { ResponseWrapper } from "../classes/response.class";
import { IEventLike } from "./event-like.interface";

/**
 * Publishers provide the interface between the underlying event system and
 * the bus. This defines the interactions the bus has with the publisher.
 */
export interface IPublisher<Evt = IEventLike> extends OnApplicationBootstrap {
  /**
   * Await the response from a remote system
   */
  awaitResponse(responseKey: string): Promise<ResponseWrapper<unknown>>;
  /**
   * Listen to the bus asynchronously but without triggering
   * event acknowledgement. Will only be called for events processed
   * by this node.
   */
  listen(handlerFn: (event: Evt) => void): string;
  /**
   * Publish a new event to the bus and remote systems
   */
  publish(event: Evt): Promise<void>;
  /**
   * Define the role of the publisher within the application. Set via the using class
   */
  role: string;
  /**
   * Subscribe to the bus. Should only be called ONCE by the relevant
   * bus as will trigger acknowledgements.
   */
  subscribe(handlerFn: (event: Evt) => void): string;
  /**
   * Unsubscribe from the bus
   */
  unsubscribe(key: string): void;
}
