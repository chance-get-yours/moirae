export type PublisherType = "memory" | "rabbitmq";

export interface IPublisherConfig {
  /**
   * In the case of a microservice system, define the domain token for this
   * specific microservice.
   *
   * @default default
   */
  domain?: "default" | string;
  /**
   * Globally unique ID for the system. Suggested: kubernetes pod name
   */
  nodeId: string;
  type: PublisherType;
}
