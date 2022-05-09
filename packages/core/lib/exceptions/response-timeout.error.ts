export class ResponseTimeoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = ResponseTimeoutError.name;
  }
}
