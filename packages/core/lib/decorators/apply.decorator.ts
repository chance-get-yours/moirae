import { ClassConstructor } from "class-transformer";
import { AggregateRoot } from "../classes/aggregate-root.class";
import { IEvent } from "../interfaces/event.interface";
import { APPLY_METADATA } from "../moirae.constants";

/**
 * Decorator applied to a method in an aggregate that marks the method as the handler for a specific
 * event type.
 *
 * @param event Event to handle
 */
export const Apply =
  (event: ClassConstructor<IEvent>): MethodDecorator =>
  (target: AggregateRoot, propertyKey: string) => {
    Reflect.defineMetadata(
      `${APPLY_METADATA}:${event.name}`,
      propertyKey,
      target,
    );
  };
