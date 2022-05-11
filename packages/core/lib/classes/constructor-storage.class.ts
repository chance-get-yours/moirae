import { ClassConstructor } from "class-transformer";

export class ConstructorStorage {
  private static _instance: ConstructorStorage;
  private _map: Map<string, ClassConstructor<unknown>>;

  constructor() {
    this._map = new Map();
  }

  public clear(): void {
    this._map.clear();
  }

  public static clear(): void {
    ConstructorStorage.getInstance().clear();
  }

  public get(name: string): ClassConstructor<unknown> | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public set(event: ClassConstructor<unknown>) {
    this._map.set(event.name, event);
  }

  public static getInstance(): ConstructorStorage {
    if (!ConstructorStorage._instance)
      ConstructorStorage._instance = new ConstructorStorage();
    return ConstructorStorage._instance;
  }
}
