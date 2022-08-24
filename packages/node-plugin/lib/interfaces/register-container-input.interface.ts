import { ICommand, ICommandHandler, IQuery, IQueryHandler } from "@moirae/core";
import type { ClassConstructor } from "class-transformer";

export type RegisterContainerInputType = "CommandHandler" | "QueryHandler";

export interface RegisterContainerInput {
  instance: any;
  role: RegisterContainerInputType;
}

export interface RegisterCommandHandlerInput extends RegisterContainerInput {
  instance: ICommandHandler<ICommand>;
  role: "CommandHandler";
  command: ClassConstructor<ICommand>;
}

export interface RegisterQueryHandlerInput extends RegisterContainerInput {
  instance: IQueryHandler<IQuery>;
  role: "QueryHandler";
  query: ClassConstructor<IQuery>;
}
