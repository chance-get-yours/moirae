import {
  Distributor,
  EventProcessor,
  IEvent,
  IPubSub,
  ObservableFactory,
  PUBLISHER_OPTIONS,
} from "@moirae/core";
import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { Channel, ConsumeMessage } from "amqplib";
import { randomUUID } from "crypto";
import { IRabbitMQPublisherConfig } from "../interfaces/rabbitmq-publisher.config";
import { RabbitMQConnection } from "./rabbitmq.connection";

@Injectable()
export class RabbitPubSubEngine
  extends EventProcessor<IEvent>
  implements IPubSub, OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly _distributor: Distributor<IEvent>;
  private _pubChannel: Channel;
  private _pubConsumer: string;
  private _PUB_EXCHANGE: string;
  private _SUB_QUEUE: string;

  constructor(
    private readonly _connection: RabbitMQConnection,
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER_OPTIONS) publisherOptions: IRabbitMQPublisherConfig,
  ) {
    super();
    this._distributor = observableFactory.generateDistributor(randomUUID());
    this._PUB_EXCHANGE = `${publisherOptions.event.namespaceRoot}-pubsub`;
    this._SUB_QUEUE = `${publisherOptions.event.namespaceRoot}-subqueue-${publisherOptions.nodeId}`;
  }

  public async beforeApplicationShutdown() {
    await this._pubChannel.cancel(this._pubConsumer);
    await this._pubChannel.close();
  }

  public async onApplicationBootstrap() {
    this._pubChannel = await this._connection.connection.createChannel();
    await this._pubChannel.assertExchange(this._PUB_EXCHANGE, "fanout");
    await this._pubChannel.assertQueue(this._SUB_QUEUE, {
      exclusive: true,
    });
    await this._pubChannel.bindQueue(this._SUB_QUEUE, this._PUB_EXCHANGE, "");
    ({ consumerTag: this._pubConsumer } = await this._pubChannel.consume(
      this._SUB_QUEUE,
      (msg: ConsumeMessage) => {
        if (msg === null) return;
        const event = this.parseEvent(msg.content.toString());
        this._distributor.publish(event);
        this._pubChannel.ack(msg);
      },
    ));
  }

  public async publish(event: IEvent<unknown>): Promise<void> {
    this._pubChannel.publish(
      this._PUB_EXCHANGE,
      "",
      Buffer.from(this.serializeEvent(event)),
    );
  }

  public subscribe(handler: (event: IEvent<unknown>) => void): string {
    return this._distributor.subscribe(handler);
  }

  public unsubscribe(key: string): void {
    this._distributor.unsubscribe(key);
  }
}
