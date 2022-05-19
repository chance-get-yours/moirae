import { instanceToPlain, plainToInstance } from "class-transformer";
import { ConstructorStorage } from "./constructor-storage.class";

export class ResponseWrapper<T = unknown> {
  public payload: T;
  private payloadType: string;

  constructor(
    payload: T,
    public readonly responseKey: string,
    public readonly routingKey: string,
  ) {
    this.payload = payload;
  }

  public toPlain(): Record<string, unknown> {
    let sample = this.payload;
    if (this.payload instanceof Array && this.payload.length > 0) {
      sample = this.payload[0];
    }
    if (sample instanceof Object) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      this.payloadType = (sample as Object).constructor.name;
    }
    return instanceToPlain(this);
  }

  public static fromPlain<T = unknown>(
    plain: Record<string, unknown>,
  ): ResponseWrapper<T> {
    const instance: ResponseWrapper<T> = plainToInstance(
      ResponseWrapper,
      plain,
    );
    const constructorMap = ConstructorStorage.getInstance();
    if (constructorMap.has(instance.payloadType)) {
      instance.payload = plainToInstance(
        constructorMap.get(instance.payloadType),
        instance.payload,
      ) as T;
    }
    return instance;
  }
}
