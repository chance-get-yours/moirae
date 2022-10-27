import { ClassConstructor } from "class-transformer";
import { ICommandHandler } from "../interfaces/command-handler.interface";
import { ICommand } from "../interfaces/command.interface";
import { COMMAND_METADATA } from "../moirae.constants";

export const CommandHandler = (command: ClassConstructor<ICommand>) => {
  return (target: ClassConstructor<ICommandHandler<ICommand>>) => {
    Reflect.defineMetadata(COMMAND_METADATA, command, target);
  };
};
