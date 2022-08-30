import { Apply } from "@moirae/core";
import { ClassConstructor } from "class-transformer";
import { IDynamicAggregate } from "../../common/interfaces/dynamic-aggregate.interface";
import { CompanyNameUpdatedEvent } from "../events/company-name-updated.event";
import { UserAssignedAsCustomerEvent } from "../events/user-assigned-as-customer.event";
import { ICustomer } from "../interfaces/customer.interface";
import { UserAggregate } from "./user.aggregate";

export type CustomerAggregate = UserAggregate & IDynamicAggregate & ICustomer;

export function DynamicCustomerAggregate<
  T extends ClassConstructor<UserAggregate>,
>(Base: T): ClassConstructor<CustomerAggregate> {
  class _customerAggregate
    extends Base
    implements ICustomer, IDynamicAggregate
  {
    public companyName: string;
    public customerId: string;

    postAggregateShift(event: UserAssignedAsCustomerEvent): void {
      this.customerId = event.$data.customerId;
    }

    @Apply(CompanyNameUpdatedEvent)
    handleCompanyNameUpdated(event: CompanyNameUpdatedEvent): void {
      this.companyName = event.$data.companyName;
    }
  }
  return _customerAggregate;
}
