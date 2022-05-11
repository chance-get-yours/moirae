import { faker } from "@faker-js/faker";
import { AccountCreatedEvent } from "../events/account-created.event";
import { AccountAggregate } from "./account.aggregate";

describe("AccountAggregate", () => {
  let aggregate: AccountAggregate;
  let streamId: string;
  beforeEach(() => {
    streamId = faker.datatype.uuid();
    aggregate = new AccountAggregate(streamId);
  });

  it("will apply an AccountCreatedEvent", () => {
    const event = new AccountCreatedEvent(streamId, {
      balance: 0,
      createdAt: new Date(),
      name: faker.lorem.word(),
    });

    aggregate.apply(event);
    expect(aggregate.balance).toEqual(event.data.balance);
    expect(aggregate.createdAt).toEqual(event.data.createdAt);
    expect(aggregate.id).toEqual(streamId);
    expect(aggregate.name).toEqual(event.data.name);
    expect(aggregate.updatedAt).toEqual(event.timestamp);
  });
});
