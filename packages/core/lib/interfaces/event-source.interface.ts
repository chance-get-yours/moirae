import { IPublisher } from "packages/core";
import { IEvent } from "./event.interface";

export interface IEventSource
  extends Pick<IPublisher<IEvent>, "subscribe" | "unsubscribe"> {
  /**
   * Append the provided events to the event stream
   * @param eventList
   */
  appendToStream(eventList: IEvent[]): Promise<IEvent[]>;
  /**
   * Read all events from the stream in order
   */
  readFromStream(streamId: IEvent["streamId"]): Promise<IEvent[]>;
}
