import { CACHE_PROVIDER, EVENT_SOURCE, InjectorFunction } from "@moirae/core";
import { TypeORMCache } from "./caches/typeorm.cache";
import { TypeORMStore } from "./stores/typeorm.store";

export const injectTypeormCache: InjectorFunction = () => ({
    exports: [],
    providers: [{
           provide: CACHE_PROVIDER,
           useClass: TypeORMCache,
       }]
})

export const injectTypeormStore: InjectorFunction = () => ({
    exports: [],
    providers: [{
               provide: EVENT_SOURCE,
               useClass: TypeORMStore,
             }]
})