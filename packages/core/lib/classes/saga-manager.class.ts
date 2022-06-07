import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { ICache } from "../interfaces/cache.interface";
import { ICommand } from "../interfaces/command.interface";
import { IEvent } from "../interfaces/event.interface";
import { CACHE_PROVIDER, SAGA_METADATA } from "../moirae.constants";
import { Saga } from "./saga.class";

@Injectable()
export class SagaManager implements OnApplicationBootstrap {
  private _sagas: Saga[];

  constructor(
    @Inject(CACHE_PROVIDER) private readonly _cache: ICache,
    private readonly _moduleContainer: ModulesContainer,
  ) {
    this._sagas = [];
  }

  public addSaga(saga: Saga) {
    this._sagas.push(saga);
  }

  public async applyEventToSagas(event: IEvent): Promise<ICommand[]> {
    return (
      await Promise.all(this._sagas.map((saga) => saga.process(event)))
    ).flat();
  }

  public onApplicationBootstrap() {
    const providers = [...this._moduleContainer.values()].flatMap((module) => [
      ...module.providers.values(),
    ]);
    providers.forEach((provider) => {
      const { instance } = provider;
      if (!instance) return;
      if (Reflect.hasMetadata(SAGA_METADATA, instance)) {
        (instance as Saga)["_cacheController"] = this._cache;
        this._sagas.push(instance as Saga);
      }
    });
  }

  public async rollbackSagas(correlationId: string): Promise<ICommand[]> {
    return (
      await Promise.all(this._sagas.map((saga) => saga.rollback(correlationId)))
    ).flat();
  }
}
