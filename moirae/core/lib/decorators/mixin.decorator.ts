import { ClassConstructor } from "class-transformer";

/**
 * Apply mixin classes to the target in order they are passed. Mixin properties will
 * override the existing methods in the target class, including any metadata that may be
 * present in either the target or the mixin class.
 */
export const applyMixins = (
  target: any,
  ...mixins: ClassConstructor<unknown>[]
) => {
  mixins.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        target,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null),
      );

      const metadataMap = new Map<string, string>(
        Reflect.getMetadataKeys(target).map((key) => [
          key,
          Reflect.getMetadata(key, target),
        ]),
      );

      Reflect.getMetadataKeys(baseCtor.prototype)
        .filter((key) => !metadataMap.has(key))
        .forEach((key) =>
          metadataMap.set(key, Reflect.getMetadata(key, baseCtor.prototype)),
        );

      for (const [key, value] of metadataMap.entries()) {
        Reflect.defineMetadata(key, value, target);
      }
    });
  });
};

/**
 * Decorator wrapper around the applyMixins function
 */
export const AddMixin =
  (...mixins: ClassConstructor<unknown>[]) =>
  (target: any) =>
    applyMixins(target, ...mixins);
