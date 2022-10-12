import { ClassConstructor } from "class-transformer";
import { IMoiraeFilter } from "../interfaces/moirae-filter.interface";
import { EXCEPTION_METADATA } from "../moirae.constants";

export const MoiraeFilter = (error: ClassConstructor<Error>) => {
  return (target: ClassConstructor<IMoiraeFilter<any>>) => {
    Reflect.defineMetadata(EXCEPTION_METADATA, error, target);
  };
};
