import { Provider } from "@nestjs/common";
import { PublisherToken, InjectorFunction, IInjectorReturn, EVENT_PUBLISHER, EVENT_PUBSUB_ENGINE } from "@moirae/core";
import { RabbitMQConnection } from "./providers/rabbitmq.connection";
import { RabbitMQPublisher } from "./publishers/rabbitmq.publisher";
import { RabbitPubSubEngine } from "./providers/rabbit-pubsub.engine";

export const injectRabbitMQPublisher: InjectorFunction = (token: PublisherToken): IInjectorReturn => {
    const response: IInjectorReturn = {
        exports: [],
        providers: [],
    };
    if (token === EVENT_PUBLISHER)
            response.providers.push({
              provide: EVENT_PUBSUB_ENGINE,
              useClass: RabbitPubSubEngine,
            });

          response.providers.push(RabbitMQConnection, {
            provide: token,
            useClass: RabbitMQPublisher,
          });

          response.exports.push(RabbitMQConnection);
    return response;
}