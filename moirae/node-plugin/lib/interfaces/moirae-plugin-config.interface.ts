import { IPublisher } from "@moirae/core";

export interface MoiraePluginConfig {
  /**
   * Register the module with a given list of domains.
   *
   * See {@link @moirae/core!MoiraeModule.forFeature}
   */
  domains: string[];
  getCommandPublisher: () => IPublisher;
  getEventPublisher: () => IPublisher;
  getQueryPublisher: () => IPublisher;
}
