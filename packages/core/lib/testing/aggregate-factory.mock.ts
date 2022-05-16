import { Provider } from "@nestjs/common";
import { AggregateFactory } from "../factories/aggregate.factory";
import { ObservableFactory } from "../factories/observable.factory";
import { EVENT_SOURCE, PUBLISHER_OPTIONS } from "../moirae.constants";
import { MemoryStore } from "../stores/memory.store";

export const mockAggregateFactory = (): Provider[] => [
  AggregateFactory,
  ObservableFactory,
  {
    provide: EVENT_SOURCE,
    useClass: MemoryStore,
  },
  {
    provide: PUBLISHER_OPTIONS,
    useValue: {},
  },
];
