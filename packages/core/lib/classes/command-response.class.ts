import { RegisterType } from "../decorators/register-type.decorator";

@RegisterType()
export class CommandResponse {
  streamId?: string;
  success: boolean;
}
