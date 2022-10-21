import { IEvent } from "./event.interface";

/**
 * Pub-sub engine to distribute events across the system after
 * processing on a single node.
 */
export interface IPubSub {
  /**
   * Distribute an event to the system
   */
  publish(event: IEvent): Promise<void>;
  /**
   * Subscribe to the event distribution and handle
   * @returns Subscription ID
   */
  subscribe(handler: (event: IEvent) => void): string;
  /**
   * Unsubscribe to the event stream
   */
  unsubscribe(key: string): void;
}
