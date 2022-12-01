import { faker } from "@faker-js/faker";
import {
  AsyncMap,
  Distributor,
  DomainStore,
  Event,
  IEvent,
  MessengerService,
  ObservableFactory,
  PUBLISHER_OPTIONS,
  QUERY_PUBLISHER,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { Channel, Message } from "amqplib";
import { EventEmitter } from "events";
import { IRabbitMQPublisherConfig } from "../interfaces/rabbitmq-publisher.config";
import { IRabbitMQConfig } from "../interfaces/rabbitmq.config";
import { RabbitMQConnection } from "../providers/rabbitmq.connection";
import { createMockChannel } from "../../testing/channel.mock";
import { createMockConnection } from "../../testing/connection.mock";
import { RabbitMQPublisher } from "./rabbitmq.publisher";
import { TestEvent } from "../../testing/test-event.class";

describe("RabbitMQPublisher", () => {
  let publisher: RabbitMQPublisher;
  let connection: RabbitMQConnection;

  const options: IRabbitMQPublisherConfig = {
    command: {} as IRabbitMQConfig,
    event: {} as IRabbitMQConfig,
    query: {
      amqplib: {},
      namespaceRoot: "__testing__",
      injector: jest.fn(),
      type: "rabbitmq",
    },
    nodeId: "__testing__",
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MessengerService,
        RabbitMQPublisher,
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

    publisher = await module.resolve(RabbitMQPublisher);
    publisher.role = QUERY_PUBLISHER;
    connection = module.get(RabbitMQConnection);
  });

  afterEach(() => {
    DomainStore.getInstance().clear();
  });

  it("will be defined", () => {
    expect(publisher).toBeDefined();
  });

  describe("handleAcknowledge", () => {
    let event: TestEvent;

    beforeEach(() => {
      event = new TestEvent();
      publisher["_activeInbound"] = new AsyncMap(
        new Distributor(new EventEmitter(), faker.datatype.uuid()),
      );
      publisher["_workChannel"] = createMockChannel();
    });

    it("will ack and delete active", async () => {
      const msg: Message = {} as Message;
      publisher["_activeInbound"].set(event.$uuid, msg);

      const ackSpy = jest.spyOn(publisher["_workChannel"], "ack");
      await publisher.acknowledgeEvent(event);

      expect(ackSpy).toHaveBeenCalledWith(msg);
      expect(publisher["_activeInbound"].get(event.$uuid)).toBeUndefined();
    });

    it("will skip ack if active request doesn't exist", async () => {
      const ackSpy = jest.spyOn(publisher["_workChannel"], "ack");
      await publisher.acknowledgeEvent(event);

      expect(ackSpy).not.toHaveBeenCalled();
    });
  });

  describe("handleBootstrap", () => {
    it("will create a response channel and bind to the response exchange", async () => {
      const responseChannel = createMockChannel();

      const resMock = jest
        .spyOn(connection.connection, "createChannel")
        .mockResolvedValueOnce(responseChannel);
      jest
        .spyOn(connection.connection, "createChannel")
        .mockResolvedValue(createMockChannel());

      await publisher["handleBootstrap"]();

      expect(resMock).toHaveBeenCalled();
      expect(responseChannel.assertExchange).toHaveBeenCalledWith(
        publisher["_RESPONSE_EXCHANGE"],
        "direct",
      );
      expect(responseChannel.assertQueue).toHaveBeenCalledWith(
        publisher["_RESPONSE_QUEUE"],
        { exclusive: true },
      );
      expect(responseChannel.bindQueue).toHaveBeenCalledWith(
        publisher["_RESPONSE_QUEUE"],
        publisher["_RESPONSE_EXCHANGE"],
        options.nodeId,
      );
      expect(responseChannel.consume).toHaveBeenCalledWith(
        publisher["_RESPONSE_QUEUE"],
        expect.any(Function),
      );
    });

    it("will create the work channel", async () => {
      const workChannel = createMockChannel();
      const domain = faker.random.word();
      DomainStore.getInstance().add(domain);

      jest
        .spyOn(connection.connection, "createChannel")
        .mockResolvedValueOnce(createMockChannel());
      const workSpy = jest
        .spyOn(connection.connection, "createChannel")
        .mockResolvedValue(workChannel);

      await publisher["handleBootstrap"]();

      expect(workSpy).toHaveBeenCalled();

      expect(workChannel.prefetch).toHaveBeenCalledWith(1);
      expect(workChannel.assertQueue).toHaveBeenCalledWith(
        publisher["_generateWorkQueue"](domain),
      );
      expect(workChannel.consume).toHaveBeenCalledWith(
        publisher["_generateWorkQueue"](domain),
        expect.any(Function),
      );
    });
  });

  describe("handlePublish", () => {
    let channel: Channel;
    beforeEach(() => {
      channel = createMockChannel();
      publisher["_workChannel"] = channel;
      publisher["_WORK_QUEUE"] = faker.name.middleName();
    });

    it("will call work channel send to queue", async () => {
      const eventString = faker.datatype.json();
      await publisher["handlePublish"](eventString, "default");

      expect(channel.publish).toHaveBeenCalledWith(
        publisher["_WORK_EXCHANGE"],
        "default",
        Buffer.from(eventString),
      );
    });
  });

  describe("handleResponse", () => {
    let channel: Channel;
    beforeEach(() => {
      channel = createMockChannel();
      publisher["_responseChannel"] = channel;
      publisher["_RESPONSE_EXCHANGE"] = faker.name.firstName();
    });

    it("will call response publish", async () => {
      const routingKey = faker.random.word();
      const responseJSON = faker.datatype.json();

      await publisher["handleResponse"](routingKey, responseJSON);

      expect(channel.publish).toHaveBeenCalledWith(
        publisher["_RESPONSE_EXCHANGE"],
        routingKey,
        Buffer.from(responseJSON),
      );
    });
  });

  describe("handleShutdown", () => {
    let response: Channel;
    let work: Channel;
    beforeEach(() => {
      const domain = faker.random.word();
      DomainStore.getInstance().add(domain);
      response = createMockChannel();
      work = createMockChannel();

      publisher["_RESPONSE_EXCHANGE"] = faker.random.alphaNumeric(4);
      publisher["_responseChannel"] = response;
      publisher["_responseConsumer"] = faker.random.alphaNumeric(4);
      publisher["_workChannel"] = work;
      publisher["_workQueueMap"].set(domain, {
        consumerTag: faker.random.word(),
        queueName: publisher["_generateWorkQueue"](domain),
      });
    });

    it("will close work channel", async () => {
      await publisher["handleShutdown"]();

      publisher["_workQueueMap"].forEach(({ consumerTag }) => {
        expect(work.cancel).toHaveBeenCalledWith(consumerTag);
      });
      expect(work.close).toHaveBeenCalled();
    });

    it("will unbind and close response channel", async () => {
      await publisher["handleShutdown"]();

      expect(response.unbindQueue).toBeCalledWith(
        publisher["_RESPONSE_QUEUE"],
        publisher["_RESPONSE_EXCHANGE"],
        options.nodeId,
      );
      expect(response.cancel).toHaveBeenCalledWith(
        publisher["_responseConsumer"],
      );
      expect(response.close).toHaveBeenCalled();
    });
  });
});
