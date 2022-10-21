import { ICacheConfig } from "./cache-config.interface";

export interface IMemoryCacheConfig extends ICacheConfig {
  type: "memory";
}
