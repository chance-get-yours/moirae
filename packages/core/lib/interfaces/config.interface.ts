import { ModuleMetadata, Provider } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { ICacheConfig } from "./cache-config.interface";
import { IPublisherConfig } from "./publisher-config.interface";
import { IStoreConfig } from "./store-config.interface";

export interface IMoiraeConfig<
  TCache extends ICacheConfig,
  TPub extends IPublisherConfig,
  TStore extends IStoreConfig,
> extends Pick<ModuleMetadata, "imports"> {
  /**
   * Cache provides a storage mechanism internal to Moirae for rapid
   * processing. Inherently transient.
   */
  cache?: TCache;
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
