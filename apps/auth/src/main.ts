import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

/**
 * designed to bootstrap (initialize and start) an application using microservices architecture with RabbitMQ as the message broker.
 */
async function bootstrap() {
  /**
   * This line creates a new NestJS application instance using the AuthModule.
   * The await keyword is used because NestFactory.create returns a Promise.
   */
  const app = await NestFactory.create(AuthModule);
  // A service provided by NestJS for accessing configuration variables.
  const configService = app.get(ConfigService);

  // reading configuration RabbitMq
  const USER = configService.get('RABBITMQ_USER');
  const PASSWORD = configService.get('RABBITMQ_PASS');
  const HOST = configService.get('RABBITMQ_HOST');
  const QUEUE = configService.get('RABBITMQ_AUTH_QUEUE');

  // This method connects the NestJS application to a microservice. It is configured to use RabbitMQ as the transport layer.
  app.connectMicroservice<MicroserviceOptions>({
    // Specifies RabbitMQ as the transport protocol.
    transport: Transport.RMQ,
    options: {
      // The connection string for RabbitMQ, constructed using the user, password, and host.
      urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
      // Indicates that the RabbitMQ broker expects acknowledgments for messages. This ensures message reliability.
      noAck: false,
      // The name of the queue to connect to.
      queue: QUEUE,
      // Additional options for the queue. `durable: true` means the queue will survive broker restarts.
      queueOptions: {
        durable: true,
      },
    },
  });
  app.startAllMicroservices(); // This line starts all connected microservices. It's essential for initiating the message listeners and enabling the application to start processing incoming messages.
}
bootstrap(); // called to execute these configurations and start the application.
/**
 * This code snippet is responsible for initializing a NestJS application with a microservices architecture,
 * specifically configured to communicate with RabbitMQ.
 * The application is bootstrapped with the AuthModule, and it sets up the RabbitMQ connection details using the ConfigService.
 * Once the microservice connection is established, the application starts all the microservices, allowing it to send and receive messages via the specified RabbitMQ queue.
 * This setup is typical in scalable, distributed applications where different parts of the system communicate asynchronously using message brokers like RabbitMQ.
 */
