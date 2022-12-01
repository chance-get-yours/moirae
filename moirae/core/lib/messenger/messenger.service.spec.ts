import { Test } from "@nestjs/testing";
import { Message } from "./messages/base.message";
import { MessengerService } from "./messenger.service";

describe("MessengerService", () => {
  let service: MessengerService;
  class TestMessage extends Message {}

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MessengerService],
    }).compile();

    service = module.get(MessengerService);
  });

  it("will be defined", () => {
    expect(service).toBeDefined();
  });

  it("will publish messages to subscribers", () => {
    const message = new TestMessage();
    const handler = jest.fn();

    service.on(TestMessage, handler);
    service.publish(message);
    expect(handler).toHaveBeenLastCalledWith(message);
  });

  it("will allow unsubscribing from messages", () => {
    const message = new TestMessage();
    const handler = jest.fn();

    const subId = service.on(TestMessage, handler);
    service.publish(message);
    service.unsubscribe(subId);

    service.publish(message);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(message);
  });

  it("will filter messages correctly", () => {
    class OtherMessage extends Message {}

    const message = new OtherMessage();
    const handler = jest.fn();

    service.on(TestMessage, handler);
    service.publish(message);

    expect(handler).not.toHaveBeenCalled();
  });
});
