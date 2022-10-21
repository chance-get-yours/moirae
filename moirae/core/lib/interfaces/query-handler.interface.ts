import { IHandler } from "./handler.interface";
import { IQuery } from "./query.interface";

export type IQueryHandler<T extends IQuery> = IHandler<T>;
