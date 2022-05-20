# @moirae/core
The core module within Moirae, required for all uses of the library. See advanced documentation at [chance-get-yours.github.io/moirae](http://chance-get-yours.github.io/moirae/).

## Installation
Install with npm
```
npm install @moirae/core
```
or yarn
```
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
TBD: explanation

