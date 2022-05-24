import { EventBus, IEvent } from "@moirae/core";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from "@nestjs/websockets";
import { filter, map, Observable, Subject } from "rxjs";

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
  @SubscribeMessage("@moirae/id")
  handleEvents(@MessageBody("id") id: string): Observable<WsResponse<IEvent>> {
    return this.subject.pipe(
      filter((event) => event.$streamId === id),
      map((event) => ({ event: "@moirae/id", data: event })),
    );
  }
}
