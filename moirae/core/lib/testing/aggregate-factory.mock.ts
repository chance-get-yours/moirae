import { Provider } from "@nestjs/common";
import { MemoryCache } from "../caches/memory.cache";
import { AggregateFactory } from "../factories/aggregate.factory";
import { ObservableFactory } from "../factories/observable.factory";
import {
  CACHE_PROVIDER,
  EVENT_SOURCE,
  PUBLISHER_OPTIONS,
} from "../moirae.constants";
import { MemoryStore } from "../stores/memory.store";

export const mockAggregateFactory = (): Provider[] => [
  AggregateFactory,
  ObservableFactory,
  {
    provide: CACHE_PROVIDER,
    useClass: MemoryCache,
  },
  {
    provide: EVENT_SOURCE,
    useClass: MemoryStore,
  },
  {
    provide: PUBLISHER_OPTIONS,
    useValue: {},
  },
];
