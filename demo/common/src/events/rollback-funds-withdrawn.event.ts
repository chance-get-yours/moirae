import { Event, IEvent, RegisterType } from "@moirae/core";
import { FundsWithdrawnEvent } from "./funds-withdrawn.event";

type RollbackFundsWithdrawnPayload = Pick<
  FundsWithdrawnEvent["$data"],
  "funds"
>;

@RegisterType()
export class RollbackFundsWithdrawnEvent extends Event implements IEvent {
  public readonly $version: number = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: RollbackFundsWithdrawnPayload,
  ) {
    super();
  }
}
