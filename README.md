# Moirae

Moirae is a collection of packages designed to simplify event sourcing and CQRS within NestJS. While the library itself is opinionated, the use of external tooling is designed to be left entirely up to the end user.

Moirae consists of a single [core](./packages/core/README.md) module and a series of plugins to support interaction with various messaging services and event stores.

The name "Moiae" comes from the Fates of Greek mythology. https://en.wikipedia.org/wiki/Moirai

## Structure
### Core
The core module provides base components and can function entirely standalone for rapid prototyping if data loss is acceptable.

### Cache
Within Moirae, the cache provides ability to store and retrieve data required to ensure distributed transactions are properly tracked and to provide the ability to reserve values, for instance to ensure unique emails across users.

#### Supported
- [x] Redis
- [ ] SQL

### Publisher
The publisher provides a structure for passing messages between nodes of a distributed system. In Moirae, this provides for functions:
- Request/Response for Commands
- Request/Response for Queries
- Event processing
- Post-processing distribution of events

#### Supported
- [x] RabbitMQ
- [ ] Redis

### Store
The store allows for the storage and retrieval of events for processing.

#### Supported
- [x] SQL
