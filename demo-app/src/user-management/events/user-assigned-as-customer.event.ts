import { Event, IEvent, RegisterType } from "@moirae/core";
import { ICustomer } from "../interfaces/customer.interface";

@RegisterType()
export class UserAssignedAsCustomerEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: Pick<ICustomer, "customerId">,
  ) {
    super();
  }
}
