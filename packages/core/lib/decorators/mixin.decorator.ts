import { ClassConstructor } from "class-transformer";

export const AddMixin =
  (...mixins: ClassConstructor<unknown>[]) =>
  (target: any) => {
    mixins.forEach((mixin) => {
      Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
        if (name !== "constructor") {
          target.prototype[name] = mixin.prototype[name];
        }
      });
    });
  };
