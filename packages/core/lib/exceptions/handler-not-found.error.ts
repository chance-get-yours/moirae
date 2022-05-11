import { RegisterType } from "../decorators/register-type.decorator";

@RegisterType()
export class HandlerNotFoundError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}
