import { ICommand, ICommandHandler } from "@moirae/core";
import type { ClassConstructor } from "class-transformer";

export type RegisterContainerInputType = "CommandHandler";

export interface RegisterContainerInput {
  instance: any;
  role: RegisterContainerInputType;
}

export interface RegisterCommandHandlerInput extends RegisterContainerInput {
  instance: ICommandHandler<ICommand>;
  role: "CommandHandler";
  command: ClassConstructor<ICommand>;
}
