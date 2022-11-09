import { Inject, Injectable } from "@nestjs/common";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { CommandResponse } from "../classes/command-response.class";
import { DomainStore } from "../classes/domain-store.class";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandlerOptions } from "../interfaces/command-handler-options.interface";
import { ICommand } from "../interfaces/command.interface";
import { IMoiraeFilter } from "../interfaces/moirae-filter.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import {
  COMMAND_METADATA,
  COMMAND_PUBLISHER,
  ESState,
  EXCEPTION_METADATA,
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
    @Inject(COMMAND_PUBLISHER) publisher: IPublisher,
    private readonly _sagaManager: SagaManager,
  ) {
    super(explorer, COMMAND_METADATA, observableFactory, publisher);
    this._publisher.role = COMMAND_PUBLISHER;
    this._errorHandlers = new Map();
  }

  /**
   * Trigger processing of a given command in one of two ways:
   * - If the current application can process the command, meaning the {@link @moirae/core!ICommand.$executionDomain | ICommand.$executionDomain property} has been
   * registered, the command will be processed asynchronously to the main thread as a Promise without interacting with external systems.
   * - If the current application cannot process the command, the command will be enqueued for processing
   * via a publisher for processing externally.
   *
   * In either scenario, the response from this function will contain relevant information for subscribing
   * to events emitted by the command processing.
   *
   * @param command - Command to process
   * @returns An object containing information about the acknowledged execution
   */
  public async execute(command: ICommand): Promise<CommandResponse> {
    if (!command.$correlationId) command.$correlationId = randomUUID();
    if (!command.STREAM_ID) command.STREAM_ID = randomUUID();
    if (DomainStore.getInstance().has(command.$executionDomain)) {
      this.executeLocal(command);
    } else {
      await this._publisher.publish(command);
    }
    return CommandResponse.fromCommand(command);
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
