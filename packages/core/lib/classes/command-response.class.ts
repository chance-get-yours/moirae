import { RegisterType } from "../decorators/register-type.decorator";
import { ICommand } from "../interfaces/command.interface";

/**
 * Response from a command execution. Reading the result should happen
 * asynchronously
 */
@RegisterType()
export class CommandResponse {
  /**
   * Transactional id generated as part of execution
   */
  correlationId: string;
  /**
   * StreamID of the aggregate processed
   */
  streamId: string;

  public static fromCommand(command: ICommand): CommandResponse {
    const response = new CommandResponse();
    response.correlationId = command.$correlationId;
    response.streamId = command.STREAM_ID;
    return response;
  }
}
