import { faker } from "@faker-js/faker";
import { EventEmitter } from "events";
import { Distributor } from "./distributor.class";

describe("Distributor", () => {
  let distributor: Distributor<string>;

  beforeEach(() => {
    distributor = new Distributor(new EventEmitter(), faker.datatype.uuid());
  });

  it("will publish a message to one subscription", () => {
    const sub = jest.fn();
    const payload = "hello world";

    distributor.subscribe(sub);
    distributor.publish(payload);
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith(payload);
  });

  it("will publish a message to all subscriptions", () => {
    const sub1 = jest.fn();
    const sub2 = jest.fn();
    const payload = "hello world";

    distributor.subscribe(sub1);
    distributor.subscribe(sub2);
    distributor.publish(payload);
    expect(sub1).toHaveBeenCalledTimes(1);
    expect(sub1).toHaveBeenCalledWith(payload);
    expect(sub2).toHaveBeenCalledTimes(1);
    expect(sub2).toHaveBeenCalledWith(payload);
  });

  it("will allow unsubscribing", () => {
    const sub1 = jest.fn();
    const sub2 = jest.fn();
    const payload = "hello world";

    distributor.subscribe(sub1);
    const id = distributor.subscribe(sub2);
    distributor.publish(payload);
    expect(sub1).toHaveBeenCalledTimes(1);
    expect(sub2).toHaveBeenCalledTimes(1);

    distributor.unsubscribe(id);
    distributor.publish(payload);
    expect(sub1).toHaveBeenCalledTimes(2);
    expect(sub2).toHaveBeenCalledTimes(1);
  });
});
