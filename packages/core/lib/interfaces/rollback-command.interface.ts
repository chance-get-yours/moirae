import { ICommand } from "./command.interface";

export interface IRollbackCommand extends ICommand {
  readonly $data: {
    streamId: string;
    correlationId: string;
  };
}

export interface IRollbackCommandConstructor {
  new (streamId: string, correlationId: string): IRollbackCommand;
}
