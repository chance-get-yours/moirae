import { OnModuleInit } from "@nestjs/common";
import { ResponseWrapper } from "../classes/response.class";
import { IEventLike } from "./event-like.interface";

export interface IPublisher<Evt = IEventLike> extends OnModuleInit {
  awaitResponse(responseKey: string): Promise<ResponseWrapper<unknown>>;
  listen(handlerFn: (event: Evt) => void): string;
  publish(event: Evt): Promise<void>;
  subscribe(handlerFn: (event: Evt) => void): string;
  unsubscribe(key: string): void;
}
