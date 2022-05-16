# Moirae

Moirae is a collection of packages designed to simplify event sourcing and CQRS within NestJS. While the library itself is opinionated, the use of external tooling is designed to be left entirely up to the end user.

Moirae consists of a single [core](./packages/core/README.md) module and a series of plugins to support interaction with various messaging services and event stores.

The name "Moiae" comes from the Fates of Greek mythology. https://en.wikipedia.org/wiki/Moirai

### Plugins
Current and proposed plugins for Moirae. Always welcome to other suggestions/PRs to add functionality.

#### Event Stores
- [ ] [EventStoreDB](https://www.eventstore.com/eventstoredb)
- [ ] [MongoDB](https://www.mongodb.com/)
- [ ] [PostgreSQL](https://www.postgresql.org/)
#### Message Brokers
- [ ] [Amazon SQS](https://aws.amazon.com/sqs/)
- [x] [Rabbit MQ](https://www.rabbitmq.com/)
- [ ] [Redis](https://redis.io/)
