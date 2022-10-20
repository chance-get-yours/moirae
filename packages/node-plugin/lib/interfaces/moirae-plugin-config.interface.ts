import { IPublisher } from "@moirae/core";

export interface MoiraePluginConfig {
  getCommandPublisher: () => IPublisher;
  getEventPublisher: () => IPublisher;
  getQueryPublisher: () => IPublisher;
}
