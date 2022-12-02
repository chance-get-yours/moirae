import { DomainStore, IPublisher, MessengerService } from "@moirae/core";

export interface MoiraePublisherConstructorParams {
  domainStore: DomainStore;
  messengerService: MessengerService;
}

export interface MoiraePluginConfig {
  /**
   * Register the module with a given list of domains.
   *
   * See {@link @moirae/core!MoiraeModule.forFeature}
   */
  domains: string[];
  getCommandPublisher: (params: MoiraePublisherConstructorParams) => IPublisher;
  getEventPublisher: (params: MoiraePublisherConstructorParams) => IPublisher;
  getQueryPublisher: (params: MoiraePublisherConstructorParams) => IPublisher;
  messengerService?: MessengerService;
}
