import { OnApplicationBootstrap } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { ICache } from "../interfaces/cache.interface";
import { ICommand } from "../interfaces/command.interface";
import { IEvent } from "../interfaces/event.interface";
import {
  IRollbackCommand,
  IRollbackCommandConstructor,
} from "../interfaces/rollback-command.interface";
import { CORRELATION_PREFIX, SAGA_METADATA } from "../moirae.constants";

interface SagaMetadataPayload {
  event: ClassConstructor<IEvent>;
  propertyKey: string;
  rollbackCommand: IRollbackCommandConstructor;
}

/**
 * The Saga class allows coordinating a process across multiple domains. The base class
 * provides transactional tracking and ability to rollback a given transaction automatically should
 * a related command/event handler fail to process.
 *
 * The saga should be extended with a series of methods decorated with the {@link core.SagaStep} decorator where
 * each method defines the `IF... THEN...` progression of the saga.
 */
export abstract class Saga implements OnApplicationBootstrap {
  private _commandConstructors: Map<
    IRollbackCommand["$name"],
    IRollbackCommandConstructor
  >;
  private _cacheController: ICache;
  private _sagaMap: Map<IEvent["$name"], SagaMetadataPayload[]>;

  constructor() {
    this._commandConstructors = new Map();
    this._sagaMap = new Map();
  }

  public onApplicationBootstrap() {
    const sagas = Reflect.getMetadata(SAGA_METADATA, this) || [];
    sagas.forEach((sagaMeta: SagaMetadataPayload) => {
      if (!this._sagaMap.has(sagaMeta.event.name))
        this._sagaMap.set(sagaMeta.event.name, []);
      this._sagaMap.get(sagaMeta.event.name).push(sagaMeta);
      this._commandConstructors.set(
        sagaMeta.rollbackCommand.name,
        sagaMeta.rollbackCommand,
      );
    });
  }

  private async _storeRollbackCommand(
    correlationId: string,
    commandConstructor: IRollbackCommandConstructor,
    streamId: string,
  ): Promise<void> {
    if (!this._cacheController) throw new Error();
    await this._cacheController.addToSet(
      `${CORRELATION_PREFIX}__${correlationId}__${commandConstructor.name}`,
      streamId,
    );
  }

  /**
   * Process an event in the context of a saga. In some cases, this means the event will
   * do nothing as the saga is not equipped to handle it. If the saga is equipped to handle the event,
   * the saga will process the event accordingly and register the correlationId and rollback
   * process for use later if needed.
   */
  public async process(event: IEvent): Promise<ICommand[]> {
    const handlers = this._sagaMap.get(event.$name) || [];
    const commands = new Array<ICommand>();
    for await (const handler of handlers) {
      const _commands: ICommand[] = this[handler.propertyKey](event);
      if (_commands.length > 0)
        await this._storeRollbackCommand(
          event.$correlationId,
          handler.rollbackCommand,
          event.$streamId,
        );
      commands.push(..._commands);
    }
    return commands;
  }

  /**
   * Rollback a specific transaction by correlationId.
   */
  public async rollback(correlationId: string): Promise<IRollbackCommand[]> {
    const constructors = [...this._commandConstructors.entries()];
    const commandArrays = await Promise.all(
      constructors.map(async ([commandName, Constructor]) => {
        const streamIds = await this._cacheController.readFromSet<string>(
          `${CORRELATION_PREFIX}__${correlationId}__${commandName}`,
        );
        return streamIds.map((id) => new Constructor(id, correlationId));
      }),
    );
    return commandArrays.flat();
  }
}
