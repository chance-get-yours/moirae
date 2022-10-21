import { Connection } from "amqplib";

export const createMockConnection = (
  options: Partial<Connection> = {},
): Connection =>
  ({
    createChannel: jest.fn(),
    ...options,
  } as Connection);
