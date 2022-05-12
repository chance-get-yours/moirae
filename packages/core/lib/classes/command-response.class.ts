import { RegisterType } from "../decorators/register-type.decorator";

/**
 * Response from a command execution. Reading the result should happen
 * asynchronously
 */
@RegisterType()
export class CommandResponse {
  /**
   * StreamID of the aggregate processed
   */
  streamId?: string;
  success: boolean;
}
