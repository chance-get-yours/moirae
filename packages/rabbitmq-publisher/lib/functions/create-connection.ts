import { connect, Options } from "amqplib";

export const createConnection = (options: Options.Connect) => connect(options);
