import {
  AsyncMap,
  BasePublisher,
  ESState,
  IEventLike,
  IPublisher,
  ObservableFactory,
  PUBLISHER_OPTIONS,
} from "@moirae/core";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { Channel, Message } from "amqplib";
import { IRabbitMQConfig } from "../interfaces/rabbitmq.config";
import { RabbitMQConnection } from "../providers/rabbitmq.connection";

@Injectable({ scope: Scope.TRANSIENT })
export class RabbitMQPublisher
  extends BasePublisher<IEventLike>
  implements IPublisher
{
  private _activeInbound: AsyncMap<Message>;
  private _responseChannel: Channel;
  private _responseConsumer: string;
  private _RESPONSE_EXCHANGE: string;
  private _RESPONSE_QUEUE: string;
  private _workChannel: Channel;
  private _workConsumer: string;
  private _WORK_EXCHANGE: string;
  private _WORK_QUEUE: string;

  protected publisherOptions: IRabbitMQConfig;

  constructor(
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER_OPTIONS) publisherOptions: IRabbitMQConfig,
    private readonly rabbitMQConnection: RabbitMQConnection,
  ) {
    super(observableFactory, publisherOptions);
    this._activeInbound = observableFactory.generateAsyncMap();
  }

  protected async handleAcknowledge(event: IEventLike): Promise<void> {
    const msg = this._activeInbound.get(event.$uuid);
    if (!msg) return;
    this._workChannel.ack(msg);
    this._activeInbound.delete(event.$uuid);
  }

  protected async handleBootstrap(): Promise<void> {
    this._RESPONSE_EXCHANGE = `${this.publisherOptions.namespaceRoot}-responseExchange-${this.role}`;
    this._RESPONSE_QUEUE = `${this.publisherOptions.namespaceRoot}-responses-${this.role}-${this.publisherOptions.nodeId}`;
    this._WORK_EXCHANGE = `${this.publisherOptions.namespaceRoot}-workExchange-${this.role}`;
    this._WORK_QUEUE = `${this.publisherOptions.namespaceRoot}-work-${this.role}-${this.publisherOptions.domain}`;

    this._responseChannel =
      await this.rabbitMQConnection.connection.createChannel();
    await this._responseChannel.assertExchange(
      this._RESPONSE_EXCHANGE,
      "direct",
    );
    await this._responseChannel.assertQueue(this._RESPONSE_QUEUE, {
      exclusive: true,
    });
    await this._responseChannel.bindQueue(
      this._RESPONSE_QUEUE,
      this._RESPONSE_EXCHANGE,
      this.publisherOptions.nodeId,
    );

    ({ consumerTag: this._responseConsumer } =
      await this._responseChannel.consume(this._RESPONSE_QUEUE, (msg) => {
        // TODO: break into own function
        if (msg === null) return;
        const response = this.parseResponse(msg.content.toString());
        this._responseMap.set(response.responseKey, response);
        this._responseChannel.ack(msg);
      }));

    this._workChannel =
      await this.rabbitMQConnection.connection.createChannel();
    await this._workChannel.prefetch(1);
    await this._workChannel.assertExchange(this._WORK_EXCHANGE, "topic");
    await this._workChannel.assertQueue(this._WORK_QUEUE);
    await this._workChannel.bindQueue(
      this._WORK_QUEUE,
      this._WORK_EXCHANGE,
      this.publisherOptions.domain,
    );

    ({ consumerTag: this._workConsumer } = await this._workChannel.consume(
      this._WORK_QUEUE,
      (msg) => {
        // TODO: break into own function
        if (msg === null) return;
        if (
          this._distributor.listenerCount === 0 ||
          this._status.current !== ESState.IDLE
        )
          this._workChannel.reject(msg, true);
        const parsedEvent = this.parseEvent(msg.content.toString());
        this._activeInbound.set(parsedEvent.$uuid, msg);
        this._distributor.publish(parsedEvent);
      },
    ));
  }

  protected async handlePublish(
    eventString: string,
    executionDomain: string,
  ): Promise<void> {
    this._workChannel.publish(
      this._WORK_EXCHANGE,
      executionDomain,
      Buffer.from(eventString),
    );
  }

  protected async handleResponse(
    routingKey: string,
    responseJSON: string,
  ): Promise<void> {
    this._responseChannel.publish(
      this._RESPONSE_EXCHANGE,
      routingKey,
      Buffer.from(responseJSON),
    );
  }

  protected async handleShutdown(): Promise<void> {
    await this._workChannel.cancel(this._workConsumer);
    await this._workChannel.close();

    await this._responseChannel.unbindQueue(
      this._RESPONSE_QUEUE,
      this._RESPONSE_EXCHANGE,
      this.publisherOptions.nodeId,
    );
    await this._responseChannel.cancel(this._responseConsumer);
    await this._responseChannel.close();
  }
}
