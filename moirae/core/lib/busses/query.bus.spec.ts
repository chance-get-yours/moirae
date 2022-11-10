import { faker } from "@faker-js/faker";
import { Test } from "@nestjs/testing";
import { DomainStore } from "../classes/domain-store.class";
import { Explorer } from "../classes/explorer.class";
import { Query } from "../classes/query.class";
import { QueryHandler } from "../decorators/query-handler.decorator";
import { RegisterType } from "../decorators/register-type.decorator";
import { ObservableFactory } from "../factories/observable.factory";
import { IPublisher } from "../interfaces/publisher.interface";
import { IQueryHandler } from "../interfaces/query-handler.interface";
import { IQuery } from "../interfaces/query.interface";
import { PUBLISHER_OPTIONS, QUERY_PUBLISHER } from "../moirae.constants";
import { MemoryPublisher } from "../publishers/memory.publisher";
import { QueryBus } from "./query.bus";

@RegisterType()
class TestQuery extends Query implements IQuery {
  $version = 1;
  $responseKey = "hello";
  $routingKey = "world";
}

@RegisterType()
class QueryResponse {
  hello = "world";
}

@QueryHandler(TestQuery)
class TestHandler implements IQueryHandler<TestQuery> {
  async execute(event: TestQuery): Promise<QueryResponse> {
    return new QueryResponse();
  }
}

describe("QueryBus", () => {
  let bus: QueryBus;
  let handler: TestHandler;
  let publisher: IPublisher;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        Explorer,
        ObservableFactory,
        QueryBus,
        {
          provide: QUERY_PUBLISHER,
          useClass: MemoryPublisher,
        },
        {
          provide: PUBLISHER_OPTIONS,
          useValue: {},
        },
        TestHandler,
      ],
    }).compile();

    bus = module.get(QueryBus);
    handler = module.get(TestHandler);
    publisher = bus["_publisher"];

    await publisher["onApplicationBootstrap"]();
    bus.onApplicationBootstrap();
  });

  it("will be defined", () => {
    expect(bus).toBeDefined();
  });

  describe("executeLocal", () => {
    it("will execute the handler", async () => {
      expect(await bus["executeLocal"](new TestQuery(), {})).toStrictEqual(
        new QueryResponse(),
      );
    });

    it("will catch, log, and return an error in execution", async () => {
      jest.spyOn(handler, "execute").mockRejectedValue(new Error());
      expect(await bus["executeLocal"](new TestQuery(), {})).toBeInstanceOf(
        Error,
      );
    });
  });

  describe("execute", () => {
    it("will call executeLocal on query and return a response", async () => {
      const localSpy = jest.spyOn(bus, "executeLocal" as never);
      const publishSpy = jest.spyOn(publisher, "publish");
      const query = new TestQuery();
      query.$executionDomain = faker.random.word();
      DomainStore.getInstance().add(query.$executionDomain);

      expect(await bus.execute(query)).toStrictEqual(new QueryResponse());
      expect(localSpy).toHaveBeenCalledWith(query, {});
      expect(publishSpy).not.toHaveBeenCalled();
    });

    it("will handle the case of an undefined response", async () => {
      jest.spyOn(handler, "execute").mockResolvedValue(undefined);
      const query = new TestQuery();

      expect(await bus.execute(query)).toStrictEqual(undefined);

      query.$responseKey = expect.any(String);
    });

    it("will handle the case of a null response", async () => {
      jest.spyOn(handler, "execute").mockResolvedValue(null);
      const query = new TestQuery();

      expect(await bus.execute(query)).toStrictEqual(null);

      query.$responseKey = expect.any(String);
    });

    it("will call IPublisher.publish for queries in a separate domain", async () => {
      const publishSpy = jest.spyOn(publisher, "publish");
      const query = new TestQuery();
      query.$executionDomain = "hello world";

      expect(await bus.execute(query)).toStrictEqual(new QueryResponse());

      query.$responseKey = expect.any(String);
      expect(publishSpy).toHaveBeenCalledWith(query);
    });
  });
});
