const express = require('express');
const { RabbitMQConnection, RabbitMQPublisher } = require('@moirae/rabbitmq');
const dotenv = require('dotenv');
const { ObservableFactory } = require('@moirae/core');
const {MoiraePlugin}= require('@moirae/node-plugin');
const { HelloQuery } = require('../../src/secondary-app/queries/hello.query');

module.exports = async () => {
    dotenv.config({path: '../.env'})
    const app = express();
    app.get('/health', (_, res) => {
        res.send({success: 'OK'})
    })

    const rabbitMQConfig = {
        amqplib: {
            hostname: process.env.RABBIT_MQ_HOST,
            password: process.env.RABBIT_MQ_PASS,
            port: +process.env.RABBIT_MQ_PORT,
            username: process.env.RABBIT_MQ_USER,
          },
        domain: 'second_app',
        namespaceRoot: "__demo-app__",
        nodeId: 'second_app',
        type: "rabbitmq",
    }

    const rmqConnection = new RabbitMQConnection(rabbitMQConfig);
    const handler = {
        execute: () => 'Hello World'
    }

    const moirae = new MoiraePlugin(
        {getPublisher: () => 
            new RabbitMQPublisher(new ObservableFactory(), rabbitMQConfig, rmqConnection)
        })
        .injectQueryHandler(handler, HelloQuery);

    return new Promise((res) => {
        const server = app.listen(0, '127.0.0.1', async () => {
            if (process.env.PUB_TYPE === 'rabbitmq') {
                await rmqConnection.onModuleInit();
                await moirae.init();
            }
            const address = server.address();
            server.on('close', async () => {
                if (process.env.PUB_TYPE === 'rabbitmq') {
                    await moirae.tearDown();
                    await rmqConnection.onApplicationShutdown();
                }
            })
            console.log(`\nDummy Server Running at port ${address.port}`)
            process.env.SECOND_SERVER = `http://${address.address}:${address.port}`;
            global.server = server;
            res();
        })
    })
}
