import { IPublisherConfig } from "@moirae/core";
import { Options } from "amqplib";

export interface IRabbitMQConfig extends IPublisherConfig {
  amqplib: Options.Connect;
  namespaceRoot: string;
  type: "rabbitmq";
}
