import { EVENT_SOURCE, InjectorFunction } from "@moirae/core";
import { EventStoreDBConnection } from "./providers/eventstoredb.connection";
import { EventStoreDbStore } from "./stores/eventstoredb.store";

export const injectEventStoreDb: InjectorFunction = () => ({
  exports: [EventStoreDBConnection],
  providers: [
    {
      provide: EVENT_SOURCE,
      useClass: EventStoreDbStore,
    },
    EventStoreDBConnection,
  ],
});
