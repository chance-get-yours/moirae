import { faker } from "@faker-js/faker";
import { CompanyNameUpdatedEvent } from "../events/company-name-updated.event";
import { UserAssignedAsCustomerEvent } from "../events/user-assigned-as-customer.event";
import { UserCreatedEvent } from "../events/user-created.event";
import { CustomerAggregate } from "./customer.aggregate";
import { UserAggregate } from "./user.aggregate";

describe("CustomerAggregate", () => {
  let customer: CustomerAggregate;

  beforeEach(() => {
    customer = new UserAggregate(faker.datatype.uuid()) as CustomerAggregate;
    customer.apply(
      new UserCreatedEvent(customer.id, {
        email: faker.datatype.uuid(),
      }),
    );
    customer.apply(
      new UserAssignedAsCustomerEvent(customer.id, {
        customerId: faker.datatype.uuid(),
      }),
    );
  });

  describe("CompanyNameUpdatedEvent", () => {
    let event: CompanyNameUpdatedEvent;

    beforeEach(() => {
      event = new CompanyNameUpdatedEvent(customer.id, {
        companyName: faker.company.name(),
      });
      customer.apply(event);
    });

    it("will apply the event", () => {
      expect(customer.companyName).toEqual(event.$data.companyName);
    });
  });
});
