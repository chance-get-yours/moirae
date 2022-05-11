import { ClassConstructor } from "class-transformer";
import { IEventSource } from "../interfaces/event-source.interface";
import { IPublisher } from "./publisher.interface";

export interface IConfig {
  /**
   * Register external types to the system to assist with serialization
   */
  externalTypes?: ClassConstructor<unknown>[];
  /**
   * Publisher provides messaging and communication for Commands and Queries
   */
  publisher?: ClassConstructor<IPublisher>;
  store?: ClassConstructor<IEventSource>;
}
