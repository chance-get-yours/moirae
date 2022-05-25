import { ModuleMetadata, Provider } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { IPublisherConfig } from "./publisher-config.interface";
import { IStoreConfig } from "./store-config.interface";

export interface IMoiraeConfig<
  TPub extends IPublisherConfig,
  TStore extends IStoreConfig,
> extends Pick<ModuleMetadata, "imports"> {
  /**
   * Register external types to the system to assist with serialization
   */
  externalTypes?: ClassConstructor<unknown>[];
  /**
   * Publisher provides messaging and communication for Commands and Queries
   */
  publisher?: TPub;
  sagas?: Provider[];
  /**
   * Store provides an event store to persist all events processed in the system.
   */
  store?: TStore;
}
