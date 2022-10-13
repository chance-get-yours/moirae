import { Inject, Injectable } from "@nestjs/common";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { CommandResponse } from "../classes/command-response.class";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandlerOptions } from "../interfaces/command-handler-options.interface";
import { ICommand } from "../interfaces/command.interface";
import { IMoiraeFilter } from "../interfaces/moirae-filter.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import {
  COMMAND_METADATA,
  ESState,
  EXCEPTION_METADATA,
  PUBLISHER,
  PublisherRole,
} from "../moirae.constants";

/**
 * Provide the ability to run commands either locally or on remote systems
 * given the correct publisher.
 */
@Injectable()
export class CommandBus extends BaseBus<ICommand> {
  private readonly _errorHandlers: Map<string, IMoiraeFilter<Error>>;
  constructor(
    explorer: Explorer,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER) publisher: IPublisher,
    private readonly _sagaManager: SagaManager,
  ) {
    super(explorer, COMMAND_METADATA, observableFactory, publisher);
    this._publisher.role = PublisherRole.COMMAND_BUS;
    this._errorHandlers = new Map();
  }

  public async execute<TRes = CommandResponse>(
    command: ICommand,
  ): Promise<TRes> {
    if (!command.$correlationId) command.$correlationId = randomUUID();
    if (!command.STREAM_ID) command.STREAM_ID = randomUUID();
    await this._publisher.publish(command);
    return CommandResponse.fromCommand(command) as unknown as TRes;
  }

  protected async executeLocal(command: ICommand): Promise<void> {
    this._status.set(ESState.ACTIVE);

    const _streamId = command.STREAM_ID || randomUUID();

    const res: unknown = await super.executeLocal(command, {
      streamId: _streamId,
    } as ICommandHandlerOptions);

    if (res instanceof Error) {
      const rollbackCommands = await this._sagaManager.rollbackSagas(
        command.$correlationId,
      );
      await Promise.all(rollbackCommands.map((c) => this.publish(c)));
      if (this._errorHandlers.has(res.name))
        await this._errorHandlers.get(res.name).catch(command, res);
    }
    this._status.set(ESState.IDLE);
  }

  protected handleInstanceImport(instance: InstanceWrapper["instance"]) {
    if (Reflect.hasMetadata(EXCEPTION_METADATA, instance.constructor)) {
      const err = Reflect.getMetadata(EXCEPTION_METADATA, instance.constructor);
      this._errorHandlers.set(err.name, instance);
    }
  }
}
