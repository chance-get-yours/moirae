import { InjectorFunction } from "./injector.interface";

type StoreType = "eventstoredb" | "memory" | "typeorm";

export interface IStoreConfig {
  injector: InjectorFunction;
  type: StoreType;
}
