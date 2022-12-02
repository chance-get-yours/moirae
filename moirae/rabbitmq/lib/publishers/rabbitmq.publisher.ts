import {
  AsyncMap,
  BasePublisher,
  DomainStore,
  DOMAIN_STORE,
  ESState,
  EVENT_PUBLISHER,
  IEventLike,
  IPublisher,
  MessengerService,
  ObservableFactory,
  PUBLISHER_OPTIONS,
  QUERY_PUBLISHER,
} from "@moirae/core";
import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { Channel, Message } from "amqplib";
import { IRabbitMQPublisherConfig } from "../interfaces/rabbitmq-publisher.config";
import { IRabbitMQConfig } from "../interfaces/rabbitmq.config";
import { RabbitMQConnection } from "../providers/rabbitmq.connection";
import { sha1 } from "object-hash";
import { RabbitMQConnectionReOpenedMessage } from "../messages";

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
  private _WORK_EXCHANGE: string;
  /**
   * Map of Queues by domain
   */
  private _workQueueMap: Map<
    string,
    {
      consumerTag?: string;
      queueName: string;
    }
  >;

  protected publisherOptions: IRabbitMQPublisherConfig;

  constructor(
    observableFactory: ObservableFactory,
    @Inject(PUBLISHER_OPTIONS) publisherOptions: IRabbitMQPublisherConfig,
    private readonly rabbitMQConnection: RabbitMQConnection,
    private readonly messengerService: MessengerService,
    @Inject(DOMAIN_STORE) private readonly domainStore: DomainStore,
  ) {
    super(observableFactory, publisherOptions);
    this._activeInbound = observableFactory.generateAsyncMap();
    this._workQueueMap = new Map();
    this.messengerService.on(RabbitMQConnectionReOpenedMessage, () => {
      this.handleBootstrap();
    });
  }

  private _generateWorkQueue(domain: string): string {
    const config = this.getRoleConfig<IRabbitMQConfig>();
    return `${config.namespaceRoot}-work-${this.role}-${domain}`;
  }

  protected async handleAcknowledge(event: IEventLike): Promise<void> {
    const msg = this._activeInbound.get(event.$uuid);
    if (!msg) return;
    this._workChannel.ack(msg);
    this._activeInbound.delete(event.$uuid);
  }

  protected async handleBootstrap(): Promise<void> {
    const config = this.getRoleConfig<IRabbitMQConfig>();

    this._RESPONSE_EXCHANGE = `${config.namespaceRoot}-responseExchange-${this.role}`;
    this._RESPONSE_QUEUE = `${config.namespaceRoot}-responses-${this.role}-${this.publisherOptions.nodeId}`;
    this._WORK_EXCHANGE = `${config.namespaceRoot}-workExchange-${this.role}`;

    if (this.role === QUERY_PUBLISHER) {
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
    }

    this._workChannel =
      await this.rabbitMQConnection.connection.createChannel();
    await this._workChannel.prefetch(1);
    await this._workChannel.assertExchange(
      this._WORK_EXCHANGE,
      this.role === EVENT_PUBLISHER ? "fanout" : "topic",
    );

    let domains = this.domainStore.getAll();
    if (this.role === EVENT_PUBLISHER) {
      const queue = this._generateWorkQueue(
        `events__${domains.length === 1 ? domains[0] : sha1({ domains })}`,
      );
      this._workQueueMap.set("all", {
        queueName: queue,
      });
      domains = ["all"];
    } else {
      domains.forEach((d) => {
        this._workQueueMap.set(d, { queueName: this._generateWorkQueue(d) });
      });
    }

    for await (const d of domains) {
      await this._workChannel.assertQueue(this._workQueueMap.get(d).queueName);
      await this._workChannel.bindQueue(
        this._workQueueMap.get(d).queueName,
        this._WORK_EXCHANGE,
        d,
      );

      const { consumerTag } = await this._workChannel.consume(
        this._workQueueMap.get(d).queueName,
        (msg) => {
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
      );
      this._workQueueMap.get(d).consumerTag = consumerTag;
    }
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
    for await (const { consumerTag } of this._workQueueMap.values()) {
      await this._workChannel.cancel(consumerTag);
    }
    await this._workChannel.close();

    if (this._responseChannel) {
      await this._responseChannel.unbindQueue(
        this._RESPONSE_QUEUE,
        this._RESPONSE_EXCHANGE,
        this.publisherOptions.nodeId,
      );
      await this._responseChannel.cancel(this._responseConsumer);
      await this._responseChannel.close();
    }
  }
}
