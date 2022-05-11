import { ClassConstructor } from "class-transformer";
import { SAGA_METADATA } from "../moirae.constants";

export const Saga = (): PropertyDecorator => {
  return (target: ClassConstructor<unknown>, propertyKey: string) => {
    const properties =
      Reflect.getMetadata(SAGA_METADATA, target.constructor) || [];
    Reflect.defineMetadata(
      SAGA_METADATA,
      [...properties, propertyKey],
      target.constructor,
    );
  };
};
