import { ICommandHandlerOptions } from "./command-handler-options.interface";
import { ICommand } from "./command.interface";

export interface ICommandHandler<T extends ICommand> {
  execute(command: T, options: ICommandHandlerOptions): Promise<void>;
}
