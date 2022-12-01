import { IPublisherMeta } from "@moirae/core";

export interface IEventStorePublisherConfig extends IPublisherMeta {
  event: {
    /**
     * Namespace root that prefixes all queues and exchanges used in the
     * system. Should reflect the total system namespace rather than the `domain` of
     * a specific system.
     */
    namespaceRoot: string;
  };
}
