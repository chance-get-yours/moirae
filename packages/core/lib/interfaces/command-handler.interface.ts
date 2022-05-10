import { ICommand } from "./command.interface";
import { IHandler } from "./handler.interface";

export type ICommandHandler<T extends ICommand> = IHandler<T>;
