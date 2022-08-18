import { Inject, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { CommandResponse } from "../classes/command-response.class";
import { ConstructorStorage } from "../classes/constructor-storage.class";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { CommandExecutionError } from "../exceptions/command-execution.error";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandlerOptions } from "../interfaces/command-handler-options.interface";
import { ICommand } from "../interfaces/command.interface";
import { ExecuteOptions } from "../interfaces/execute-options.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import {
  COMMAND_METADATA,
  ESState,
  PUBLISHER,
  PublisherRole,
} from "../moirae.constants";

/**
 * Provide the ability to run commands either locally or on remote systems
 * given the correct publisher.
 */
@Injectable()
export class CommandBus extends BaseBus<ICommand> {
  constructor(
    explorer: Explorer,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER) publisher: IPublisher,
    private readonly _sagaManager: SagaManager,
  ) {
    super(explorer, COMMAND_METADATA, observableFactory, publisher);
    this._publisher.role = PublisherRole.COMMAND_BUS;
  }

  public async execute<TRes = CommandResponse>(
    command: ICommand,
    options?: ExecuteOptions,
  ): Promise<TRes> {
    if (!command.$correlationId) command.$correlationId = randomUUID();
    const response = await super.execute<CommandResponse>(command, options);
    if (options?.throwError && response.error) {
      const ErrorConstructor = ConstructorStorage.getInstance().get(
        response.error.name,
      );
      if (ErrorConstructor) {
        throw plainToInstance(ErrorConstructor, response.error);
      } else {
        throw new CommandExecutionError(command);
      }
    }
    return response as unknown as TRes;
  }

  protected async executeLocal(command: ICommand): Promise<CommandResponse> {
    this._status.set(ESState.ACTIVE);

    const response = new CommandResponse();
    response.correlationId = command.$correlationId;
    response.streamId = command.STREAM_ID || randomUUID();

    const res: unknown = await super.executeLocal(command, {
      streamId: response.streamId,
    } as ICommandHandlerOptions);
    response.success = !(res instanceof Error);

    if (!response.success) {
      const rollbackCommands = await this._sagaManager.rollbackSagas(
        command.$correlationId,
      );
      await Promise.all(rollbackCommands.map((c) => this.publish(c)));
      response.error = res as Error;
    }

    this._status.set(ESState.IDLE);
    return response;
  }
}
