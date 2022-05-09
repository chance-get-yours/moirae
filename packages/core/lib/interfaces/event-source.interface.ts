import { IEvent } from "./event.interface";

export interface IEventSource {
  /**
   * Append the provided events to the event stream
   * @param streamId
   * @param eventList
   */
  appendToStream(
    streamId: IEvent["streamId"],
    eventList: IEvent[],
  ): Promise<IEvent[]>;
  /**
   * Read all events from the stream in order
   */
  readFromStream(streamId: IEvent["streamId"]): Promise<IEvent[]>;
}
