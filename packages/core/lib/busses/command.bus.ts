import { Inject, Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { BaseBus } from "../classes/base.bus";
import { ObservableFactory } from "../factories/observable.factory";
import { ICommand } from "../interfaces/command.interface";
import { IPublisher } from "../interfaces/publisher.interface";
import { COMMAND_METADATA, PUBLISHER } from "../moirae.constants";

@Injectable()
export class CommandBus extends BaseBus<ICommand> {
  constructor(
    modulesContainer: ModulesContainer,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER) publisher: IPublisher,
  ) {
    super(COMMAND_METADATA, modulesContainer, observableFactory, publisher);
  }
}
