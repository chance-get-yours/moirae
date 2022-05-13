import { IPublisherConfig } from "@moirae/core";
import { Options } from "amqplib";

export interface IRabbitMQConfig extends IPublisherConfig {
  /**
   * Connection parameters for the underlying `amqplib` library
   */
  amqplib: Options.Connect;
  /**
   * Namespace root that prefixes all queues and exchanges used in the system
   */
  namespaceRoot: string;
  type: "rabbitmq";
}
