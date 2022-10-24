import { EventBus, IEvent } from "@moirae/core";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from "@nestjs/websockets";
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

  constructor(private readonly eventBus: EventBus) {
    this.subject = new Subject();
    this.eventBus.listen((event) => {
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
