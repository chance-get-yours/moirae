import { IPublisher } from "@moirae/core";

export interface MoiraePluginConfig {
  domains: string[];
  getCommandPublisher: () => IPublisher;
  getEventPublisher: () => IPublisher;
  getQueryPublisher: () => IPublisher;
}
