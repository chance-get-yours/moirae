import { ICommand } from "./command.interface";
import { IEvent } from "./event.interface";

export type SagaHandler = (event: IEvent) => ICommand[] | undefined;
