import { IPublisherMeta } from "@moirae/core";
import { IRabbitMQConfig } from "./rabbitmq.config";

export interface IRabbitMQPublisherConfig extends IPublisherMeta {
  command: IRabbitMQConfig;
  event: IRabbitMQConfig;
  query: IRabbitMQConfig;
}
