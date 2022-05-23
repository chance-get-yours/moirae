import { RegisterType } from "../decorators/register-type.decorator";

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
  streamId?: string;
  success: boolean;
}
