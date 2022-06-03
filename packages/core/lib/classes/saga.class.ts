import { OnApplicationBootstrap } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { ICommand } from "../interfaces/command.interface";
import { IEvent } from "../interfaces/event.interface";
import {
  IRollbackCommand,
  IRollbackCommandConstructor,
} from "../interfaces/rollback-command.interface";
import { SAGA_METADATA } from "../moirae.constants";

interface SagaMetadataPayload {
  event: ClassConstructor<IEvent>;
  propertyKey: string;
  rollbackCommand: IRollbackCommandConstructor;
}

export abstract class Saga implements OnApplicationBootstrap {
  private _commandConstructors: Map<
    IRollbackCommand["$name"],
    IRollbackCommandConstructor
  >;
  private _storage: Map<
    IEvent["$correlationId"],
    Map<IRollbackCommand["$name"], Set<IRollbackCommand["$data"]["streamId"]>>
  >;
  private _sagaMap: Map<IEvent["$name"], SagaMetadataPayload[]>;

  constructor() {
    this._commandConstructors = new Map();
    this._sagaMap = new Map();
    this._storage = new Map();
  }

  public onApplicationBootstrap() {
    const sagas = Reflect.getMetadata(SAGA_METADATA, this) || [];
    sagas.forEach((sagaMeta: SagaMetadataPayload) => {
      if (!this._sagaMap.has(sagaMeta.event.name))
        this._sagaMap.set(sagaMeta.event.name, []);
      this._sagaMap.get(sagaMeta.event.name).push(sagaMeta);
    });
  }

  private _storeRollbackCommand(
    correlationId: string,
    commandConstructor: IRollbackCommandConstructor,
    streamId: string,
  ) {
    if (!this._commandConstructors.has(commandConstructor.name))
      this._commandConstructors.set(
        commandConstructor.name,
        commandConstructor,
      );
    if (!this._storage.has(correlationId))
      this._storage.set(correlationId, new Map());
    if (!this._storage.get(correlationId).has(commandConstructor.name))
      this._storage.get(correlationId).set(commandConstructor.name, new Set());
    this._storage.get(correlationId).get(commandConstructor.name).add(streamId);
  }

  public process(event: IEvent): ICommand[] {
    const handlers = this._sagaMap.get(event.$name) || [];
    const commands = new Array<ICommand>();
    for (const handler of handlers) {
      const _commands: ICommand[] = this[handler.propertyKey](event);
      if (_commands.length > 0)
        this._storeRollbackCommand(
          event.$correlationId,
          handler.rollbackCommand,
          event.$streamId,
        );
      commands.push(..._commands);
    }
    return commands;
  }

  public rollback(correlationId: string): IRollbackCommand[] {
    const related = this._storage.get(correlationId);
    if (!related) return [];
    return [...related.entries()].flatMap(([commandName, streamIds]) => {
      const Command = this._commandConstructors.get(commandName);
      return [...streamIds].map((id) => new Command(id, correlationId));
    });
  }
}
