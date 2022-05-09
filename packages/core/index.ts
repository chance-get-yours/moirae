// classes
export { AggregateRoot } from "./lib/classes/aggregate-root.class";
export { Event } from "./lib/classes/event.class";
// decorators
export { Apply } from "./lib/decorators/apply.decorator";
// factories
export { AggregateFactory } from "./lib/factories/aggregate.factory";
// interfaces
export type { ICommand } from "./lib/interfaces/command.interface";
export type { IEventSource } from "./lib/interfaces/event-source.interface";
export type { IEvent } from "./lib/interfaces/event.interface";
export type { IQuery } from "./lib/interfaces/query.interface";
// constants
export { EVENT_SOURCE } from "./lib/moirae.constants";
// modules
export { MoiraeModule } from "./lib/moirae.module";
