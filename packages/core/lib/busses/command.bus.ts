import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { Explorer } from "../classes/explorer.class";
import { SagaManager } from "../classes/saga-manager.class";
import { ObservableFactory } from "../factories/observable.factory";
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

  protected async executeLocal(command: ICommand) {
    this._status.set(ESState.ACTIVE);
    const response = await super.executeLocal(command);
    if (response instanceof Error) {
      const rollbackCommands = await this._sagaManager.rollbackSagas(
        command.$correlationId,
      );
      await Promise.all(rollbackCommands.map((c) => this.publish(c)));
    }
    this._status.set(ESState.IDLE);
    return response;
  }
}
