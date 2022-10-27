import { ClassConstructor } from "class-transformer";
import { IQueryHandler } from "../interfaces/query-handler.interface";
import { IQuery } from "../interfaces/query.interface";
import { QUERY_METADATA } from "../moirae.constants";

/**
 * Decorator to mark a provider as the handler for a query
 */
export const QueryHandler = (query: ClassConstructor<IQuery>) => {
  return (target: ClassConstructor<IQueryHandler<IQuery>>) => {
    Reflect.defineMetadata(QUERY_METADATA, query, target);
  };
};
