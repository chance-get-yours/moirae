import { ICommand } from "./command.interface";

export interface IMoiraeFilter<T extends Error> {
  catch(command: ICommand, error: T): void | Promise<void>;
}
