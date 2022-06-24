import { KeyValue } from "./lib/entities/key-value.entity";
import { SetRoot } from "./lib/entities/set-root.entity";
import { SetValue } from "./lib/entities/set-value.entity";

// caches
export { TypeORMCache } from "./lib/caches/typeorm.cache";
// entities
export { EventStore } from "./lib/entities/event-store.entity";
// interfaces
export type { ITypeORMStoreConfig } from "./lib/interfaces/typeorm-config.interface";
// stores
export { TypeORMStore } from "./lib/stores/typeorm.store";
export const CACHE_ENTITIES = [KeyValue, SetRoot, SetValue];
