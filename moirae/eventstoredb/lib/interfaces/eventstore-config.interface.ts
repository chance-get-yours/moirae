import { IStoreConfig } from "@moirae/core";
import {} from "@eventstore/db-client";

export interface IEventStoreConfig extends IStoreConfig {
  type: "eventstoredb";
  connectionString: string;
}
