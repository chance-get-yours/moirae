import { ModuleMetadata } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { IEventSource } from "../interfaces/event-source.interface";
import { IPublisherConfig } from "./publisher-config.interface";

export interface IMoiraeConfig<TPub extends IPublisherConfig>
  extends Pick<ModuleMetadata, "imports"> {
  /**
   * Register external types to the system to assist with serialization
   */
  externalTypes?: ClassConstructor<unknown>[];
  /**
   * Publisher provides messaging and communication for Commands and Queries
   */
  publisher?: TPub;
  /**
   * Store provides an event store to persist all events processed in the system.
   */
  store?: ClassConstructor<IEventSource>;
}
