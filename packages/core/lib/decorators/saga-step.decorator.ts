import { ClassConstructor } from "class-transformer";
import { IEvent } from "../interfaces/event.interface";
import { IRollbackCommandConstructor } from "../interfaces/rollback-command.interface";
import { SAGA_METADATA } from "../moirae.constants";

/**
 * Define a step in a saga. Related to {@link core.Saga}
 *
 * @param event Triggering event class
 * @param rollbackCommand Rollback command related to the aggregate that applies the triggering event
 */
export const SagaStep =
  <T extends IEvent>(
    event: ClassConstructor<T>,
    rollbackCommand: IRollbackCommandConstructor,
  ): MethodDecorator =>
  (target, propertyKey) => {
    const sagas = Reflect.getMetadata(SAGA_METADATA, target.constructor) || [];
    Reflect.defineMetadata(
      SAGA_METADATA,
      [...sagas, { event, propertyKey, rollbackCommand }],
      target,
    );
  };
