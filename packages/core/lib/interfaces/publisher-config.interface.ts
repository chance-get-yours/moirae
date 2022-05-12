export type PublisherType = "memory" | "rabbitmq";

export interface IPublisherConfig {
  type: PublisherType;
}
