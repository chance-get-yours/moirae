import { ICommand } from "./command.interface";

/**
 * For each aggregate, a rollback command should be defined. This allows
 * this saga manager to rollback aggregates by streamId and correlationId and in doing so,
 * undo a transaction that failed elsewhere in the system.
 *
 * It is required to pass the streamId and correlationId as the only parameters in the class
 * constructor.
 *
 * @constructor `new (streamId: string, correlationId: string)`
 */
export interface IRollbackCommand extends ICommand {
  readonly $data: {
    /**
     * Stream to rollback
     */
    streamId: string;
    /**
     * Transaction to rollback
     */
    correlationId: string;
  };
}

export interface IRollbackCommandConstructor {
  new (streamId: string, correlationId: string): IRollbackCommand;
}
