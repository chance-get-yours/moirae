import { ModuleMetadata, Provider } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { ICacheConfig } from "./cache-config.interface";
import { IPublisherConfig, IPublisherMeta } from "./publisher-config.interface";
import { IStoreConfig } from "./store-config.interface";

export interface IMoiraeConfig<
  TCache extends ICacheConfig,
  TStore extends IStoreConfig,
  TCommand extends IPublisherConfig,
  TEvent extends IPublisherConfig,
  TQuery extends IPublisherConfig,
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
   * Publisher provides messaging and communication for Commands, Events, and Queries
   */
  publisher?: IPublisherMeta & {
    command: TCommand;
    event: TEvent;
    query: TQuery;
  };
  sagas?: Provider[];
  /**
   * Store provides an event store to persist all events processed in the system.
   */
  store?: TStore;
}
