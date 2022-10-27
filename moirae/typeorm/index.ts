import { KeyValue } from "./lib/entities/key-value.entity";
import { SetRoot } from "./lib/entities/set-root.entity";
import { SetValue } from "./lib/entities/set-value.entity";

// entities
export const CACHE_ENTITIES = [KeyValue, SetRoot, SetValue];
export { EventStore } from "./lib/entities/event-store.entity";
// injectors
export { injectTypeormCache, injectTypeormStore } from "./lib/injector";
// interfaces
export type { ITypeORMStoreConfig } from "./lib/interfaces/typeorm-config.interface";
