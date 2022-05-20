import { instanceToPlain, plainToInstance } from "class-transformer";
import { ConstructorStorage } from "../classes/constructor-storage.class";
import { IEventLike } from "../interfaces/event-like.interface";

export class EventProcessor<Evt = IEventLike> {
  /*
   * Parse the raw event string into a useable event instance
   */
  public parseEvent(eventString: string): Evt {
    const plain: IEventLike = JSON.parse(eventString);
    const InstanceConstructor = ConstructorStorage.getInstance().get(
      plain.$name,
    );
    return plainToInstance(InstanceConstructor, plain) as Evt;
  }

  public serializeEvent(event: Evt): string {
    const plain = instanceToPlain(event);
    return JSON.stringify(plain);
  }
}
