import { AggregateRoot, Apply, applyMixins, IEvent } from "@moirae/core";
import { IDynamicAggregate } from "@demo/common";
import { UserAssignedAsCustomerEvent } from "../events/user-assigned-as-customer.event";
import { UserCreatedEvent } from "../events/user-created.event";
import { IUser } from "../interfaces/user.interface";
import { UserType } from "../user-management.constants";
import { DynamicCustomerAggregate } from "./customer.aggregate";

/**
 * A demonstration implementation of dynamic aggregates via TS mixins. Here the
 * aggregate root for all User Accounts which can then be extended with specific behavior
 * as defined by other aggregates, specifically the `CustomerAggregate`.
 */
export class UserAggregate
  extends AggregateRoot
  implements IUser, IDynamicAggregate
{
  public email: string;
  public userType: UserType;

  public get id() {
    return this.streamId;
  }

  @Apply(UserCreatedEvent)
  handleUserCreated(event: UserCreatedEvent): void {
    this.email = event.$data.email;
    this.userType = UserType.UNASSIGNED;
  }

  /**
   * Change the userType to customer and use TS mixin functionality to alter the prototype
   * to be a CustomerAggregate rather than a UserAggregate. This requires using the
   * `IDynamicAggregate.postAggregateShift` method in order to handle any changes required
   * by the new prototype to finish the conversion.
   */
  @Apply(UserAssignedAsCustomerEvent)
  handleUserAssignedAsCustomer(event: UserAssignedAsCustomerEvent): void {
    this.userType = UserType.CUSTOMER;
    applyMixins(this, DynamicCustomerAggregate(UserAggregate));
    this.postAggregateShift(event);
  }

  /**
   * Stub method as a placeholder (a parallel to an abstract method) for handling
   * aggregate conversions elsewhere.
   */
  postAggregateShift(event: IEvent): void {
    // stub
  }
}
