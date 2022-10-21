import { IPublisherConfig } from "./publisher-config.interface";

export interface IMemoryPublisherConfig extends IPublisherConfig {
  type: "memory";
}
