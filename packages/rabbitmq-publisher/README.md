# @moirae/rabbitmq-publisher

A Moirae publisher leveraging RabbitMQ as a transport layer providing:
- RabbitMQConnection: a connection instance for RabbitMQ. Can be resused (e.g. PubSub)
- RabbitMQPublisher: Override the default `PUBLISHER` token

## Lifecycle
**`onModuleInit`**
- Initialize connection to RabbitMQ

**`onApplicationBootstrap`**
- Initialize RabbitMQPublisher

**`beforeApplicationShutdown`**
- Tear down RabbitMQPublisher

**`onApplicationShutdown`**
- Tear down connection to RabbitMQ
