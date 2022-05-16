import { IPublisherConfig } from "./publisher-config.interface";

export interface MemoryPublisherConfig extends IPublisherConfig {
  type: "memory";
}
