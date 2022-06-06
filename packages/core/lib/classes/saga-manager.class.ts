import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { ICommand } from "../interfaces/command.interface";
import { IEvent } from "../interfaces/event.interface";
import { SAGA_METADATA } from "../moirae.constants";
import { Saga } from "./saga.class";

@Injectable()
export class SagaManager implements OnApplicationBootstrap {
  private _sagas: Saga[];

  constructor(private readonly _moduleContainer: ModulesContainer) {
    this._sagas = [];
  }

  public addSaga(saga: Saga) {
    this._sagas.push(saga);
  }

  public applyEventToSagas(event: IEvent): ICommand[] {
    return this._sagas.flatMap((saga) => saga.process(event));
  }

  public onApplicationBootstrap() {
    const providers = [...this._moduleContainer.values()].flatMap((module) => [
      ...module.providers.values(),
    ]);
    providers.forEach((provider) => {
      const { instance } = provider;
      if (!instance) return;
      if (Reflect.hasMetadata(SAGA_METADATA, instance)) {
        this._sagas.push(instance as Saga);
      }
    });
  }

  public rollbackSagas(correlationId: string): ICommand[] {
    return this._sagas.flatMap((saga) => saga.rollback(correlationId));
  }
}
