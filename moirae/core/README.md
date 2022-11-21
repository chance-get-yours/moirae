# @moirae/core

The core module within Moirae, required for all uses of the library. See advanced documentation at [chance-get-yours.github.io/moirae](http://chance-get-yours.github.io/moirae/) for full documentation of classes, fields, and functions.

The [demo application](https://github.com/chance-get-yours/moirae/tree/main/demo) provides a useful demonstation of nearly all aspects of Moirae.

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

Within Moirae, data follows a circular pattern. On the write side, commands are generated externally (e.g. an API call) are then distributed based on the `ICommand.$executionDomain` field on the Command. If a given node can process the command(meaning the domain has been registered with `MoiraeModule.forFeature(...)`) then the Command will be processed asychronously without interacting with the Command Bus.

For Commands with a different `ICommand.$exectionDomain` than the local node, the Command is published to the `CommandBus` and any node that can process the Command may retirieve it an perform the necessary logic to execute the command. This processing can generate events which are stored on the event store in addition to being distributed throughout the system.

Once distributed, events may be processed by any number of event handlers in addition to generating side-effect commands via sagas. These commands are then published and the cycle continues. A key element part is the use of event handlers to update the read side with the new data.

Queries function similar to commands however without generating any events or side-effects.

### Handlers

In general, a Handler is a NestJS provider designed to take specific input and execute logic based on that.

### CommandHandler

Note that the `execute` method can only ever return void | Promise<void>. This is because commands are inherently stateless and can be executed asynchronously to any other processing happening in the application.

```ts
// Decorate the class with the CommandHandler decorator, specifiying the Command
// which will invoke this handler. Commands can only ever have one CommandHandler.
@CommandHandler(SayHelloCommand)
export class SayHelloHandler
    // Implementing the interface provides the structure for the `execute` method
    implements ICommandHandler<SayHelloCommand>
{
    // As this is a NestJS provider, other providers can be injected
    constructor(
        // The AggregateFactory provided by Moirae enables a given AggregateRoot to
        // be populated from the EventStore.
        private readonly factory: AggregateFactory,
        private readonly service: HelloService,
    ) {}

    // Provide the required method, taking the Command as an input as well as an
    // optional Options object.
    public async execute(
        command: SayHelloCommand,
        options: ICommandHandlerOptions,
    ): Promise<void> {
        const aggregate = await this.factory.mergeContext(...);

        const event = new HelloSaidEvent(
            aggregate.streamId,
            { message: "Hello World" });

        // Apply the event to the Aggregate
        aggregate.apply(event);

        /* Logic to validate the new Aggregate */

        // Commit the event to the EventStore and trigger publishing
        // to other systems
        await aggregate.commit(command);
    }
}
```

### EventHandler

Like the CommandHandler, the EventHandler is stateless and asynchronous. These are useful for updating the Read side of a CQRS database system.

```ts
// Decorate the class with the EventHandler decorator, specifying the Event
// which will invoke this handler. There are no limitations to how many EventHandlers
// may be invoked by a single Event type.
@EventHandler(HelloSaidEvent)
// Implementing the interface provides the structure for the `execute` method
export class HelloSaidHandler implements IEventHandler<HelloSaidEvent> {
  constructor(
    // As this is a NestJS provider, other providers can be injected
    private readonly service: HelloService,
  ) {}

  public async execute(event: HelloSaidEvent): Promise<void> {
    // Transform the event to an Entity, for instance
    const entity = Entity.fromEvent(event);

    // Commit the record to the database
    await this.service.save(entity);
  }
}
```

### QueryHandler

Unlike Command or Event handlers, QueryHandlers are stateful, meaning it is expected to return a response. Like CommandHandlers, QueryHandlers will attempt to execute the query on the local node if the node matches the query's `IQuery.$executionDomain` field, otherwise the query will be published to the network and a response awaited.

```ts
// Decorate the class with the QueryHandler decorator, specifying the Query
// which will invoke this handler. Queries only ever have one QueryHandler.
@QueryHandler(FindHelloByIdQuery)
// Implementing the interface provides the structure for the `execute` method
export class FindHelloByIdHandler implements IQueryHandler<FindHelloByIdQuery> {
  constructor(
    // As this is a NestJS provider, other providers can be injected
    private readonly service: InventoryService,
  ) {}

  public execute({ helloId }: FindHelloByIdQuery): Promise<IHelloObject> {
    // Query the database and return the object
    return this.service.findOne(helloId);
  }
}
```

### Aggregate Root

Reading: [Khalil Stemmler on Aggregates](https://khalilstemmler.com/articles/typescript-domain-driven-design/aggregate-design-persistence/)

The AggregateRoot provides a basis for domain models. Moirae leverages the factory pattern to create and use Aggregates as it optimizes the ability to inject much needed dependencies into an instance of the Aggregate. The abstract base class should be extended and additional fields added to support the domain logic.

#### Events

Applying an event to the aggregate requires three functions to be complete:

**Apply** - Decorate a function that updates the state of the aggregate given the specified event

**Rollback** - Given a specific event, create a rollback event to reverse the effects of the event

**Apply** - As rollback events are stored just as normal events, each rollback event should have an apply function as well.

### Transactions

One of the most challenging aspects of Event Driven Architecture is how to handle transactions that cross domain boundaries. Within Moirae, we implement the Saga pattern.

Sagas are defined as a class with a series of methods that respond to a given event type. Sagas are controlled automatically to emit rollback commands for all related domain objects in the event of an error to compensate the transaction.

```ts
@Injectable()
export class HelloWorldSaga extends Saga {
  // using the SagaStep decorator, we define the input event and the rollback command
  // in case of an error with the command/event processing
  @SagaStep(HelloSaidEvent, NoMoreHelloCommand)
  sayHelloWorld(event: HelloSaidEvent): ICommand[] {
    // We always return an array, even if there's just one event
    return [
      new SayWorldCommand({
        message: event.$data.message,
      }),
    ];
  }
}
```

Additionally, the `IEvent.$metadata` field is automatically merged with all commands emitted as part of a SagaStep, as well as the all-important `IEvent.$correlationId` field to link the emitted commands to a given event.

### Uniqueness

A known shortfall of event based systems is the inability to reliably enforce uniqueness in aggregates. Moirae solves this using a reservation system, the idea being that potentially unique values should be reserved prior to events being committed and these reservations released once the projection is updated. The reservation allows the system to compensate for the delay and eventual consistency of the read/write side. As an example, consider the case for a unique email:

1. CreateUserCommand is generated as part of a controller
2. CreateUserHandler successfully reserves UserAggregate.email = `fake@mail.co`
3. CreateUserHandler queries the projections database for users with the email `fake@mail.co` and finds nothing
4. CreateUserHandler properly commits the UserCreatedEvent
5. UserCreatedHandler updates the projections database with the new user
6. UserCreatedHandler releases the reservation for UserAggregate.email

It is important to release the reservations on commit to the projections.

## Recommended Patterns

### Interfaces

Typescript interfaces provide a clear and clean way to define the shape of domain objects. Take the example below:

```ts
// define an interface for a person as the domain root
interface IPersonType {
  id: string; // Really a UUID
  firstName: string;
  lastName: string;
}

// create an AggregateRoot based off this interface
class PersonAggregate extends AggregateRoot implements IPersonType {
  public firstName: string;
  public lastName: string;

  // Typescript getters can provide an easy way to alias properties on an object
  public get id(): string {
    return this.streamId;
  }
}

// define an entity for a SQL database for easy queries
// using TypeORM
@Entity()
class PersonEntity implements IPersonType {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}

// and an event can be made of a partial of the interface
class PersonCreatedEvent extends Event implements IEvent {
  // Versioning events is important!
  public readonly $version = 1;

  constuctor(
    // remember, this will be alias as `IPersonType.id` later on
    public readonly $streamId: string,
    // let's say that only the first name is required for creating
    // a person
    public readonly $data: Pick<IPersonType, "firstName">,
  ) {}
}
```
