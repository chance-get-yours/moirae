// busses
export { QueryBus } from "./lib/busses/query.bus";
// classes
export { AggregateRoot } from "./lib/classes/aggregate-root.class";
export { Event } from "./lib/classes/event.class";
export { Query } from "./lib/classes/query.class";
// decorators
export { Apply } from "./lib/decorators/apply.decorator";
export { QueryHandler } from "./lib/decorators/query-handler.decorator";
export { RegisterType } from "./lib/decorators/register-type.decorator";
// factories
export { AggregateFactory } from "./lib/factories/aggregate.factory";
export { ObservableFactory } from "./lib/factories/observable.factory";
// interfaces
export type { ICommand } from "./lib/interfaces/command.interface";
export type { IEventSource } from "./lib/interfaces/event-source.interface";
export type { IEvent } from "./lib/interfaces/event.interface";
export type { IPublisher } from "./lib/interfaces/publisher.interface";
export type { IQueryHandler } from "./lib/interfaces/query-handler.interface";
export type { IQuery } from "./lib/interfaces/query.interface";
// modules
export { MoiraeModule } from "./lib/moirae.module";
