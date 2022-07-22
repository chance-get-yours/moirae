import { RegisterType } from "../decorators/register-type.decorator";
import { ICommand } from "../interfaces/command.interface";

@RegisterType()
export class CommandExecutionError extends Error {
  constructor(public readonly command: ICommand) {
    super(
      `Command execution for command ${command.$name}:${command.$uuid} has failed`,
    );
    this.name = this.constructor.name;
  }
}
