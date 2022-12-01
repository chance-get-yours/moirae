import { Message } from "@moirae/core";

export class RabbitMQConnectionClosedMessage extends Message {
  constructor(public readonly crashed: boolean) {
    super();
  }
}
