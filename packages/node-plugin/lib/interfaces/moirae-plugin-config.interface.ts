import { IPublisher } from "@moirae/core";

export interface MoiraePluginConfig {
  getPublisher: () => IPublisher;
}
