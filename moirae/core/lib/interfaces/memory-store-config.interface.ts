import { IStoreConfig } from "./store-config.interface";

export interface IMemoryStoreConfig extends IStoreConfig {
  type: "memory";
}
