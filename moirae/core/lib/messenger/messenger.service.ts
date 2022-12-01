import { Injectable } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { Message } from "./messages/base.message";

type HandlerFn<T extends Message> = (message: T) => void;

/**
 * Class to provide an internal messaging bus for a system
 * functioning entirely in memory.
 */
@Injectable()
export class MessengerService {
  /**
   * Internally use an event emitter to
   * provide messaging functionality
   */
  private ee: EventEmitter;
  /**
   * Maintain all subscriptions for messages
   * in order to allow unsubscribing
   */
  private subscriptions: Map<
    string,
    {
      message: string;
      handler: HandlerFn<Message>;
    }
  >;

  constructor() {
    this.ee = new EventEmitter();
    this.subscriptions = new Map();
  }

  /**
   * Subscribe to a specific message type and react
   *
   * @param message Message to listen for
   * @param handler Handler function for the message
   * @returns Subscription ID for use in `MessengerService.unsubscribe`
   */
  public on<T extends Message>(
    message: ClassConstructor<T>,
    handler: HandlerFn<T>,
  ): string {
    const subscriptionId = randomUUID();
    this.subscriptions.set(subscriptionId, {
      handler,
      message: message.name,
    });
    this.ee.addListener(message.name, handler);
    return subscriptionId;
  }

  /**
   * Publish a message to all subscribers
   *
   * @param message
   */
  public publish(message: Message): void {
    this.ee.emit(message.name, message);
  }

  /**
   * Unsubscribe from a previous subscription
   *
   * @param subscriptionId
   */
  public unsubscribe(subscriptionId: string): void {
    const { handler, message } = this.subscriptions.get(subscriptionId);
    this.ee.removeListener(message, handler);
    this.subscriptions.delete(subscriptionId);
  }
}
