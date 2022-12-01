import { Message } from "@moirae/core";

export class RabbitMQConnectionErrorMessage extends Message {
  constructor(public readonly error: Error) {
    super();
  }
}
