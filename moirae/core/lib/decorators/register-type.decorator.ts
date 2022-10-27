import { ClassConstructor } from "class-transformer";
import { ConstructorStorage } from "../classes/constructor-storage.class";

/**
 * Decorator to be applied to any class that is intended to transfer
 * through the CQRS system, including errors.
 */
export const RegisterType = (): ClassDecorator => (target: unknown) => {
  if (target instanceof Object) {
    const storage = ConstructorStorage.getInstance();
    storage.set(target as ClassConstructor<unknown>);
  }
};
