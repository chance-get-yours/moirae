# Moirae

Moirae is a collection of packages designed to simplify event sourcing and CQRS within NestJS. While the library itself is opinionated, the use of external tooling is designed to be left entirely up to the end user.

The purpose behind this project was to streamline CQRS/ES infrastructure within the context of a NestJS application. The makers of NestJS provide a [recipe for CQRS](https://docs.nestjs.com/recipes/cqrs) however this is sufficient only for a proof-of-concept environment and doesn’t encourage best practices:

- The use of RxJS to create a one-to-many bus limits command/event/query processing to a single node, meaning…
  - The application MUST run as a singular monolith with limited ability to scale horizontally
  - All commands/events/queries present but un-processed on a node will disappear at shutdown
- Command handlers are allowed to return data, implicitly allowing inexperienced developers to violate the CQRS pattern
- There is no in-built way to handle Saga rollbacks and compensating events
- Overall, there is very little structure to encourage best practices; most features must be implemented by the developers

Of course these limitations can be overcome in a variety of ways, however these are not insignificant challenges and must be done carefully to ensure the long term stability of the application. Moirae provides much of the missing functionality from the NestJS/CQRS module with a tight coupling to event sourcing and the added advantage of enabling teams to change technologies as the needs of the application change.

Moirae consists of a single Core module and a series of plugins to support interaction with various messaging services and event stores.

The name "Moirae" comes from the Fates of Greek mythology. https://en.wikipedia.org/wiki/Moirai

## Recommended Reading

- [Martin Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html)
- [Martin Fowler on DDD](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Martin Fowler on Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Udi Dahan on Race Conditions](https://udidahan.com/2010/08/31/race-conditions-dont-exist/)
- [Yves Reynhout on Models](youtube.com/watch?v=7StN-vNjRSw)
- [Microsoft on CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Microservices.io on EventSourcing](https://microservices.io/patterns/data/event-sourcing.html)
- [Greg Young: Versioning in an Event Sourced System](https://leanpub.com/esversioning/read)

## Structure

### Core

The core module provides base components and can function entirely standalone for rapid prototyping if data loss is acceptable.

### Cache

Within Moirae, the cache provides ability to store and retrieve data required to ensure distributed transactions are properly tracked and to provide the ability to reserve values, for instance to ensure unique emails across users.

#### Supported

- [x] Redis
- [x] SQL

### Publisher

The publisher provides a structure for passing messages between nodes of a distributed system. In Moirae, this provides for functions:

- Request/Response for Commands
- Request/Response for Queries
- Event processing
- Pre and Post processing distribution of events

#### Supported

- [x] RabbitMQ
- [ ] Redis

### Store

The store allows for the storage and retrieval of events for processing.

#### Supported

- [x] SQL

## Usage

See Core documentation:

- [TypeDoc](/moirae/modules/_moirae_core.html#usage)
- [Repository](./moirae/core/README.md#usages)
