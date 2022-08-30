import { IEvent } from "@moirae/core";

export interface IDynamicAggregate {
  postAggregateShift(event: IEvent): void;
}
