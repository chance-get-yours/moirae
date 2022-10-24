import { faker } from "@faker-js/faker";
import { UserAssignedAsCustomerEvent } from "../events/user-assigned-as-customer.event";
import { UserCreatedEvent } from "../events/user-created.event";
import { UserType } from "../user-management.constants";
import { UserAggregate } from "./user.aggregate";

describe("UserAggregate", () => {
  let user: UserAggregate;

  beforeEach(() => {
    user = new UserAggregate(faker.datatype.uuid());
  });

  describe("UserCreatedEvent", () => {
    let event: UserCreatedEvent;

    beforeEach(() => {
      event = new UserCreatedEvent(user.id, { email: faker.internet.email() });
      user.apply(event);
    });

    it("will apply the event", () => {
      expect(user.email).toEqual(event.$data.email);
    });
  });

  describe("UserAssignedAsCustomerEvent", () => {
    let event: UserAssignedAsCustomerEvent;

    beforeEach(() => {
      user.apply(
        new UserCreatedEvent(user.id, { email: faker.internet.email() }),
      );
      event = new UserAssignedAsCustomerEvent(user.id, {
        customerId: faker.datatype.uuid(),
      });
      user.apply(event);
    });

    it("will change the UserType to Customer", () => {
      expect(user.email).toBeDefined();
      expect(user.userType).toEqual(UserType.CUSTOMER);
      expect(user["customerId"]).toEqual(event.$data.customerId);
    });
  });
});
