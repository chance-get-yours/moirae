import { faker } from "@faker-js/faker";
import { Channel } from "amqplib";

export const createMockChannel = (options: Partial<Channel> = {}): Channel =>
  ({
    ack: jest.fn(),
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    cancel: jest.fn(),
    close: jest.fn(),
    consume: jest.fn(() => ({ consumerTag: faker.random.alphaNumeric(5) })),
    prefetch: jest.fn(),
    publish: jest.fn(),
    sendToQueue: jest.fn(),
    unbindQueue: jest.fn(),
    ...options,
  } as Channel);
