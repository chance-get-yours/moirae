import { InjectorFunction } from "./injector.interface";

export type PublisherType = "memory" | "rabbitmq";

/**
 * Publisher configuration object
 */
export interface IPublisherConfig {
  /**
   * Function to provide the core module with the necessary
   * providers and export tokens
   */
  injector: InjectorFunction;
  type: PublisherType;
}

export interface IPublisherMeta {
  /**
   * Globally unique ID for the system. Suggested: kubernetes pod name
   */
  nodeId: string;
}
