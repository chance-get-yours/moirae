# @moirae/core
The core module within Moirae, required for all uses of the library. See advanced documentation at [chance-get-yours.github.io/moirae](http://chance-get-yours.github.io/moirae/).

**Table of Contents**
- [Configuration](#configuration)
- [Usage](#usage)
    - [Recommended Reading](#recommended-reading)
    - [Control Flow](#control-flow)
    - [Aggregate Root](#aggregate-root)
        - [Events](#events)
    - [Uniqueness](#uniqueness)

## Installation
Install with npm
```sh
npm install @moirae/core
```
or yarn
```sh
yarn add @moirae/core
```

## Configuration
WIP

## Usage
Moirae core ships with only an in-memory message publisher and an in-memory event store, meaning all application data is lost on restart. Useful for a PoC but not as much otherwise. This is where the plugins come in. Add the appropriate plugin configuration to the root module and enable access to various third party message brokers and event stores. 

### Recommended Reading
- [Martin Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html)
- [Martin Fowler on DDD](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Udi Dahan on Race Conditions](https://udidahan.com/2010/08/31/race-conditions-dont-exist/)
- [Yves Reynhout on Models](youtube.com/watch?v=7StN-vNjRSw)

### Control Flow
Within Moirae, data follows a circular pattern. On the write side, commands are generated externally (e.g. an API call) and are published to the command bus. Any node in the system can retrive the command and perform processing on it. This processing can generate events which are stored on the event store in addition to being distributed throughout the system. 

Once distributed, events may be processed by any number of event handlers in addition to generating side-effect commands via sagas. These commands are then published and the cycle continues. A key element part is the use of event handlers to update the read side with the new data.

Queries function similar to commands however without generating any events or side-effects.

### Aggregate Root
Reading: [Khalil Stemmler on Aggregates](https://khalilstemmler.com/articles/typescript-domain-driven-design/aggregate-design-persistence/)

The AggregateRoot provides a basis for domain models. Moirae leverages the factory pattern to create and use Aggregates as it optimizes the ability to inject much needed dependencies into an instance of the Aggregate. The abstract base class should be extended and additional fields added to support the domain logic.

#### Events
Applying an event to the aggregate requires three functions to be complete:

**Apply** - Decorate a function that updates the state of the aggregate given the specified event

**Rollback** - Given a specific event, create a rollback event to reverse the effects of the event

**Apply** - As rollback events are stored just as normal events, each rollback event should have an apply function as well.

### Uniqueness
A known shortfall of event based systems is the inability to reliably enforce uniqueness in aggregates. Moirae solves this using a reservation system, the idea being that potentially unique values should be reserved prior to events being committed and these reservations released once the projection is updated. The reservation allows the system to compensate for the delay and eventual consistency of the read/write side. As an example, consider the case for a unique email:

1. CreateUserCommand is generated as part of a controller
2. CreateUserHandler successfully reserves UserAggregate.email = `fake@mail.co`
3. CreateUserHandler queries the projections database for users with the email `fake@mail.co` and finds nothing
4. CreateUserHandler properly commits the UserCreatedEvent
5. UserCreatedHandler updates the projections database with the new user
6. UserCreatedHandler releases the reservation for UserAggregate.email

It is important to release the reservations on commit to the projections.
