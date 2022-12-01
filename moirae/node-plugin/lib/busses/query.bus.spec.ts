import { faker } from "@faker-js/faker";
import {
  IQueryHandler,
  MemoryPublisher,
  MessengerService,
  ObservableFactory,
} from "@moirae/core";
import { TestQuery } from "../../testing-classes/test.query";
import { Container } from "../classes/container.class";
import { QueryBus } from "./query.bus";

class TestQueryHandler implements IQueryHandler<TestQuery> {
  execute(): Promise<void> {
    return Promise.resolve();
  }
}

describe("QueryBus", () => {
  let bus: QueryBus;
  let handler: TestQueryHandler;

  beforeEach(() => {
    handler = new TestQueryHandler();

    const container = new Container();
    container.register({
      query: TestQuery,
      instance: handler,
      role: "QueryHandler",
    });

    const factory = new ObservableFactory();

    bus = new QueryBus(
      container,
      new MessengerService(),
      factory,
      new MemoryPublisher(factory, {
        nodeId: faker.datatype.uuid(),
      }),
    );

    bus.onApplicationBootstrap();
  });

  it("will correctly register the handler", () => {
    expect(bus["_handlerMap"].get(TestQuery.name)).toEqual(handler);
  });

  it("will call TestQuery.execute when running bus.executeLocal with a TestQuery", async () => {
    const query = new TestQuery();
    const handlerSpy = jest.spyOn(handler, "execute");

    await bus["executeLocal"](query, {});

    expect(handlerSpy).toHaveBeenCalledTimes(1);
    expect(handlerSpy).toHaveBeenCalledWith(query, {});
  });
});
