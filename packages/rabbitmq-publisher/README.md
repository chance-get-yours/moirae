# @moirae/rabbitmq-publisher

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
