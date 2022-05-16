export type PublisherType = "memory" | "rabbitmq";

export interface IPublisherConfig {
  /**
   * Globally unique ID for the system. Suggested: kubernetes pod name
   */
  nodeId: string;
  type: PublisherType;
}
