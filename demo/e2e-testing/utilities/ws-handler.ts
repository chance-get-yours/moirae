import { Distributor, IEvent } from "@moirae/core";
import { INestApplication } from "@nestjs/common";
import { WsResponse } from "@nestjs/websockets";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { Application } from "express";
import { AddressInfo } from "net";
import { MessageEvent, WebSocket } from "ws";

export class WsHandler {
  private readonly _distributor: Distributor<IEvent>;
  private readonly _socket: WebSocket;
  private _responses: IEvent<unknown>[];

  constructor(app: Application) {
    this._distributor = new Distributor(new EventEmitter(), randomUUID());
    this._responses = [];
    const address = app.listen().address() as unknown as AddressInfo;
    this._socket = new WebSocket(`ws://[${address.address}]:${address.port}`);
    this._socket.onmessage = (message: MessageEvent) => {
      const rawEvent: WsResponse<IEvent<unknown>> = JSON.parse(
        message.data.toString(),
      );
      const { data } = rawEvent;
      this._responses.push(data);
      this._distributor.publish(data);
    };
  }

  private awaitOpen(): Promise<void> {
    if (this._socket.readyState.toString() !== WebSocket.OPEN.toString())
      return new Promise<void>((res) => {
        this._socket.onopen = function () {
          res();
        };
      });
    return;
  }

  public awaitMatch(filterFn: (event: IEvent) => boolean): Promise<IEvent> {
    const initialMatch = this._responses.find(filterFn);
    if (initialMatch) return Promise.resolve(initialMatch);
    return new Promise<IEvent>((res, rej) => {
      let subId: string = undefined;
      const timeout = setTimeout(() => {
        if (subId) this._distributor.unsubscribe(subId);
        rej("Wait for event failed");
      }, 3000);
      subId = this._distributor.subscribe((event) => {
        if (filterFn(event)) {
          clearTimeout(timeout);
          if (subId) this._distributor.unsubscribe(subId);
          res(event);
        }
      });
    });
  }

  public clear() {
    this._responses = [];
  }

  public close() {
    if (this._socket.OPEN) this._socket.close();
  }

  public send(data: any) {
    this._socket.send(data);
  }

  public static async fromApp(app: Application): Promise<WsHandler> {
    const handler = new WsHandler(app);
    await handler.awaitOpen();
    return handler;
  }
}
