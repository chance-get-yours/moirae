import { EventBus, EVENT_PUBSUB_ENGINE, IEvent, IPubSub } from "@moirae/core";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from "@nestjs/websockets";
import { Inject } from "@nestjs/common";
import { filter, map, Observable, Subject } from "rxjs";

export enum Subscriptions {
  ID = "@moirae/id",
  CORRELATION = "@moirae/correlationId",
  REQUESTOR = "@moirae/requestor",
}

/**
 * Enable WS support for interfacing with the event system
 */
@WebSocketGateway()
export class MoiraeWsGateway {
  private readonly subject: Subject<IEvent>;

  constructor(
    @Inject(EVENT_PUBSUB_ENGINE) private readonly eventPubSub: IPubSub,
  ) {
    this.subject = new Subject();
    this.eventPubSub.subscribe((event) => {
      this.subject.next(event);
    });
  }

  /**
   * Subscribe to all events related to a specific ID
   */
  @SubscribeMessage(Subscriptions.ID)
  handleEvents(@MessageBody("id") id: string): Observable<WsResponse<IEvent>> {
    return this.subject.pipe(
      filter((event) => event.$streamId === id),
      map((event) => ({ event: Subscriptions.ID, data: event })),
    );
  }

  /**
   * Subscribe to all events related to a specific correlationId
   */
  @SubscribeMessage(Subscriptions.CORRELATION)
  handleCorrelation(
    @MessageBody("correlationId") correlationId: string,
  ): Observable<WsResponse<IEvent>> {
    return this.subject.pipe(
      filter((event) => event.$correlationId === correlationId),
      map((event) => ({ event: Subscriptions.CORRELATION, data: event })),
    );
  }

  /**
   * Subscribe to all events correlated to a specific requestor
   */
  @SubscribeMessage(Subscriptions.REQUESTOR)
  handleRequestor(
    @MessageBody("requestorId") requestorId: string,
  ): Observable<WsResponse<IEvent>> {
    return this.subject.pipe(
      filter((event) => event.$metadata?.requestorId === requestorId),
      map((event) => ({ event: Subscriptions.REQUESTOR, data: event })),
    );
  }
}
