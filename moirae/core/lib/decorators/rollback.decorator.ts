import { ClassConstructor } from "class-transformer";
import { AggregateRoot } from "../classes/aggregate-root.class";
import { IEvent } from "../interfaces/event.interface";
import { ROLLBACK_METADATA } from "../moirae.constants";

/**
 * Decorator applied to a method in an aggregate that marks the method as the handler to generate
 * a rollback event given an event type. Decorated method should return a rollback event.
 *
 * @param event Event to handle
 */
export const Rollback =
  (event: ClassConstructor<IEvent>): MethodDecorator =>
  (target: AggregateRoot, propertyKey: string) => {
    Reflect.defineMetadata(
      `${ROLLBACK_METADATA}:${event.name}`,
      propertyKey,
      target,
    );
  };
