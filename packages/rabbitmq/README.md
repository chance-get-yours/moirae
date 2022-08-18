# @moirae/rabbitmq

A Moirae publisher leveraging RabbitMQ as a transport layer providing:
- RabbitMQConnection: a connection instance for RabbitMQ. Can be resused (e.g. PubSub)
- RabbitMQPublisher: Override the default `PUBLISHER` token
- RabbitPubSubEngine: Override the default `EVENT_PUBSUB_ENGINE` token

## Lifecycle
**`onModuleInit`**
- Initialize connection to RabbitMQ

**`onApplicationBootstrap`**
- Initialize RabbitMQPublisher
- Initialize RabbitPubSubEngine

**`beforeApplicationShutdown`**
- Tear down RabbitMQPublisher
- Tear down RabbitPubSubEngine

**`onApplicationShutdown`**
- Tear down connection to RabbitMQ

## External Systems
In cases where events should be published externally to the application (in the case of analytics for instance), there are two ways to subscribe to the event stream.

### Pre-processing
To subscribe pre-processing, meaning before the core application has processed and stored the event, first create a queue for the service and bind the queue to the event store exchange with either the `domain` field specified in the configuration or with `#` to subscribe to all by default.

Related: [Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-python.html)

### Post-processing
To subscribe post-processing within the core application, simply create a queue and bind it to the pubsub exchange. 

Related: [Fanout Exchange](https://www.rabbitmq.com/tutorials/tutorial-three-python.html)
