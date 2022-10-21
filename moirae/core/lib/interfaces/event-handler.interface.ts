import { IEvent } from "./event.interface";
import { IHandler } from "./handler.interface";

export type IEventHandler<T extends IEvent> = IHandler<T>;
