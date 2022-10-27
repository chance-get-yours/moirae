import { InjectorFunction } from "./injector.interface";

type StoreType = "memory" | "typeorm";

export interface IStoreConfig {
  injector: InjectorFunction
  type: StoreType;
}
