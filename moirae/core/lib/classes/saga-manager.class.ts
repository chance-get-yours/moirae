import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ICache } from "../interfaces/cache.interface";
import { ICommand } from "../interfaces/command.interface";
import { IEvent } from "../interfaces/event.interface";
import { IRollbackCommand } from "../interfaces/rollback-command.interface";
import {
  CACHE_PROVIDER,
  CORRELATION_PREFIX,
  SAGA_METADATA,
} from "../moirae.constants";
import { ConstructorStorage } from "./constructor-storage.class";
import { Explorer } from "./explorer.class";
import { Saga } from "./saga.class";

@Injectable()
export class SagaManager implements OnApplicationBootstrap {
  private _sagas: Saga[];

  constructor(
    @Inject(CACHE_PROVIDER) private readonly _cache: ICache,
    private readonly _explorer: Explorer,
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
    this._explorer.getProviders().forEach((provider) => {
      const { instance } = provider;
      if (!instance || typeof instance !== "object") return;
      if (Reflect.hasMetadata(SAGA_METADATA, instance)) {
        (instance as Saga)["_cacheController"] = this._cache;
        this._sagas.push(instance as Saga);
      }
    });
  }

  public async rollbackSagas(correlationId: string): Promise<ICommand[]> {
    const commandArrays = await this._cache.readFromSet<string>(
      `${CORRELATION_PREFIX}__${correlationId}`,
    );
    return commandArrays.flat().map((commandKey: string) => {
      const [name, id] = commandKey.split(":");
      const Constructor = ConstructorStorage.getInstance().get(name);
      return new Constructor(id, correlationId) as IRollbackCommand;
    });
  }
}
