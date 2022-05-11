import { ClassConstructor } from "class-transformer";
import { IEventHandler } from "../interfaces/event-handler.interface";
import { IEvent } from "../interfaces/event.interface";
import { EVENT_METADATA } from "../moirae.constants";

export const EventHandler = (query: ClassConstructor<IEvent>) => {
  return (target: ClassConstructor<IEventHandler<IEvent>>) => {
    Reflect.defineMetadata(EVENT_METADATA, query, target);
  };
};
