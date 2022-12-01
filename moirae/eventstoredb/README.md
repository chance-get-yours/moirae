# @moirae/node-plugin

NodeJS port of Moirae Core module to enable usage in non-NestJS environments. Note this is not the ideal configuration and should only be used in edge cases.

## Supported Features

- [ ] AggregateFactory
- [ ] Command Execution
- [x] Command Listening
- [ ] Event Listening
- [ ] Event Persistence
- [ ] Event PubSub
- [ ] Query Execution
- [x] Query Listening

## Setup

Moirae requires more advanced configuration when operating in this mode. As an example with RabbitMQ:

```js
const {ObservableFactory} = require('@moirae/core');
const {MoiraePlugin} = require('@moirae/node-plugin');
const {RabbitMQConnection, RabbitMQPublisher} = require('@moirae/rabbitmq');

// Define the parameters of the connection and initialize it
const rabbitMQConfig = {/* config contents */};
const connection = new RabbitMQConnection(rabbitMQConfig);

const moirae = new MoiraePlugin({
    domains: ["myApp"],
    // Provide a way to instantiate new Publisher instances
    getCommandPublisher: () =>
        new RabbitMQPublisher(new ObservableFactory(), rabbitMQConfig, rmqConnection),
    getEventPublisher: () =>
        new RabbitMQPublisher(new ObservableFactory(), rabbitMQConfig, rmqConnection),
    getQueryPublisher: () =>
        new RabbitMQPublisher(new ObservableFactory(), rabbitMQConfig, rmqConnection)
});

// Add Query/Command handlers
moirae.injectCommandHandler(...);
moirae.injectQueryHandler(...);

// Initialize
await rmqConnection.onModuleInit();
await moirae.init();

// ... App logic ...

// Teardown
await rmqConnection.onApplicationShutdown();
await moirae.tearDown();
```

When operating in a non-NestJS environment, the plugin must compensate for the lack of a Dependency Injection container and therefore creates one itself. However the user must provide some key elements: namely the publisher and event store as they must be created independently of Moirae.

Additionally the lifecycle methods of NestJS may need to be managed independently. In the above example, the connection lifecycle methods of `onModuleInit` and `onApplicationShutdown` are not called for the RabbitMQConnection automatically. These methods are handled for all elements gotten from the MoiraePlugin, including the Publishers generated on startup.

### Commands, Events, Queries

Commands, Events, and Queries must be duplicated across all systems as the DTOs are key for the usage of Moirae.
