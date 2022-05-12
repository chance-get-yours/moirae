import {
  BasePublisher,
  IEventLike,
  IPublisher,
  ObservableFactory,
  ResponseWrapper,
} from "@moirae/core";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { Channel, Connection, ConsumeMessage } from "amqplib";
import { RABBITMQ_CONNECTION } from "../rabbitmq.constants";

@Injectable({ scope: Scope.TRANSIENT })
export class RabbitMQPublisher
  extends BasePublisher<IEventLike>
  implements IPublisher
{
  private _activeRequests: Map<string, ConsumeMessage>;
  private _activeResponses: Map<string, ConsumeMessage>;
  private _responseChannel: Channel;
  private _responseConsumer: string;
  private _workChannel: Channel;
  private _workConsumer: string;

  constructor(
    @Inject(RABBITMQ_CONNECTION) private readonly _connection: Connection,
    observableFactory: ObservableFactory,
  ) {
    super(observableFactory);
  }

  awaitResponse(responseKey: string): Promise<ResponseWrapper<unknown>> {
    throw new Error("Method not implemented.");
  }
  listen(handlerFn: (event: IEventLike) => void): string {
    throw new Error("Method not implemented.");
  }
  publish(event: IEventLike): Promise<void> {
    throw new Error("Method not implemented.");
  }
  subscribe(handlerFn: (event: IEventLike) => void): string {
    throw new Error("Method not implemented.");
  }
  unsubscribe(key: string): void {
    throw new Error("Method not implemented.");
  }
  public async onModuleInit() {
    this._activeRequests = new Map();
    this._activeRequests = new Map();
  }
}
