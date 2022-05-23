import { Inject, Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { randomUUID } from "crypto";
import { BaseBus } from "../classes/base.bus";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommand } from "../interfaces/command.interface";
import { ExecuteOptions } from "../interfaces/execute-options.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { COMMAND_METADATA, PUBLISHER } from "../moirae.constants";

/**
 * Provide the ability to run commands either locally or on remote systems
 * given the correct publisher.
 */
@Injectable()
export class CommandBus extends BaseBus<ICommand> {
  constructor(
    modulesContainer: ModulesContainer,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER) publisher: IPublisher,
  ) {
    super(COMMAND_METADATA, modulesContainer, observableFactory, publisher);
    this._publisher.role = "__command-bus__";
  }

  public execute<TRes>(
    command: ICommand,
    options?: ExecuteOptions,
  ): Promise<TRes> {
    if (!command.$correlationId) command.$correlationId = randomUUID();
    return super.execute(command);
  }
}
