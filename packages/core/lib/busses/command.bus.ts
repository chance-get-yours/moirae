import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { CommandResponse } from "../classes/command-response.class";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommandHandlerOptions } from "../interfaces/command-handler-options.interface";
import { ICommand } from "../interfaces/command.interface";
import { ExecuteOptions } from "../interfaces/execute-options.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { COMMAND_METADATA, ESState, PUBLISHER } from "../moirae.constants";

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
    this._publisher.role = "__command-bus__";
  }

  public execute<TRes>(
    command: ICommand,
    options?: ExecuteOptions,
  ): Promise<TRes> {
    if (!command.$correlationId) command.$correlationId = randomUUID();
    return super.execute(command, options);
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
