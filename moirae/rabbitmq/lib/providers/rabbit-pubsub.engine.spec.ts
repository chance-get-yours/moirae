import { faker } from "@faker-js/faker";
import {
  IPublisherMeta,
  ObservableFactory,
  PUBLISHER_OPTIONS,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { Channel } from "amqplib";
import { IRabbitMQConfig } from "../interfaces/rabbitmq.config";
import { TestEvent } from "../publishers/rabbitmq.publiser.spec";
import { createMockChannel } from "../../testing/channel.mock";
import { createMockConnection } from "../../testing/connection.mock";
import { RabbitPubSubEngine } from "./rabbit-pubsub.engine";
import { RabbitMQConnection } from "./rabbitmq.connection";

describe("RabbitPubSubEngine", () => {
  let connection: RabbitMQConnection;
  let engine: RabbitPubSubEngine;

  const options: IPublisherMeta & { event: IRabbitMQConfig } = {
    event: {
      amqplib: {},
      namespaceRoot: "__testing__",
      type: "rabbitmq",
      injector: jest.fn(),
    },
    nodeId: "__testing__",
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RabbitPubSubEngine,
        ObservableFactory,
        {
          provide: RabbitMQConnection,
          useFactory: () => ({ connection: createMockConnection() }),
        },
        {
          provide: PUBLISHER_OPTIONS,
          useValue: options,
        },
      ],
    }).compile();

    connection = module.get(RabbitMQConnection);
    engine = module.get(RabbitPubSubEngine);
  });

  it("will be defined", () => {
    expect(engine).toBeDefined();
  });

  describe("beforeApplicationShutdown", () => {
    beforeEach(() => {
      engine["_pubChannel"] = createMockChannel();
    });

    it("will call channel cancel", async () => {
      await engine.beforeApplicationShutdown();
      expect(engine["_pubChannel"].cancel).toHaveBeenCalled();
    });

    it("will call channel close", async () => {
      await engine.beforeApplicationShutdown();
      expect(engine["_pubChannel"].close).toHaveBeenCalled();
    });
  });

  describe("onApplicationBootstrap", () => {
    let channel: Channel;

    beforeEach(() => {
      channel = createMockChannel();
      jest
        .spyOn(connection.connection, "createChannel")
        .mockResolvedValue(channel);
    });
    it("will assert the pub exchange", async () => {
      await engine.onApplicationBootstrap();
      expect(channel.assertExchange).toHaveBeenCalledWith(
        engine["_PUB_EXCHANGE"],
        "fanout",
      );
    });

    it("will assert the pub channel and bind to the exchange", async () => {
      await engine.onApplicationBootstrap();
      expect(channel.assertQueue).toHaveBeenCalledWith(engine["_SUB_QUEUE"], {
        exclusive: true,
      });
      expect(channel.bindQueue).toHaveBeenCalledWith(
        engine["_SUB_QUEUE"],
        engine["_PUB_EXCHANGE"],
        "",
      );
    });

    it("will consume from the channel", async () => {
      await engine.onApplicationBootstrap();
      expect(channel.consume).toHaveBeenCalledWith(
        engine["_SUB_QUEUE"],
        expect.any(Function),
      );
    });
  });

  describe("publish", () => {
    let channel: Channel;

    beforeEach(() => {
      channel = createMockChannel();
      engine["_pubChannel"] = channel;
    });
    it("will publish a message to the exchange", async () => {
      const payload = new TestEvent();

      await engine.publish(payload);
      expect(channel.publish).toHaveBeenCalledWith(
        engine["_PUB_EXCHANGE"],
        "",
        Buffer.from(engine.serializeEvent(payload)),
      );
    });
  });

  describe("subscribe", () => {
    it("will call distributor subscribe", () => {
      const subSpy = jest.spyOn(engine["_distributor"], "subscribe");
      const handler = jest.fn();

      expect(engine.subscribe(handler)).toEqual(expect.any(String));
      expect(subSpy).toHaveBeenCalledWith(handler);
    });
  });

  describe("unsubscribe", () => {
    it("will call distributor unsubscribe", () => {
      const unsubSpy = jest.spyOn(engine["_distributor"], "unsubscribe");
      const key = faker.datatype.uuid();

      engine.unsubscribe(key);
      expect(unsubSpy).toHaveBeenCalledWith(key);
    });
  });
});
