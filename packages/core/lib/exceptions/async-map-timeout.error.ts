import { RegisterType } from "../decorators/register-type.decorator";

@RegisterType()
export class AsyncMapTimeoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}
