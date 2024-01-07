import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '@app/shared';

// which is a module in a NestJS application.
// NestJS modules are used to organize related components such as controllers, services,
// and providers, facilitating modularity and maintainability
@Module({
  imports: [
    /**
     * This imports the configuration module.
     * forRoot method is called with an object specifying that the module should use a .env file
     * for configuration and be globally available across the application.
     */
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    /**
     * This is the JSON Web Token module used for handling JWTs.
     * It's registered with default configuration.
     */
    JwtModule.register({}),
    /**
     * A custom shared module, containing shared utilities, services, or components used across the application.
     */
    SharedModule,
  ],
  /**
   * An array that lists the controllers managed by this module.
   * In this case, it includes AuthController, which handles authentication-related requests.
   */
  controllers: [AuthController],
  /**
   * This array lists the providers (services, factories, etc.)
   * that will be instantiated by the NestJS Dependency Injection (DI) system and available for use in this module.
   */
  providers: [
    /**
     * The service handling business logic for authentication.
     * A factory provider for USER_SERVICE
     */
    AuthService,
    {
      provide: 'USER_SERVICE',
      /**
       * It uses ConfigService to read RabbitMQ configuration settings
       * (like user, password, host, and queue) from the environment file.
       */
      useFactory: (configService: ConfigService) => {
        const USER = configService.get('RABBITMQ_USER');
        const PASSWORD = configService.get('RABBITMQ_PASS');
        const HOST = configService.get('RABBITMQ_HOST');
        const QUEUE = configService.get('RABBITMQ_USER_QUEUE');
        /**
         * Creates a ClientProxy for RabbitMQ (message broker)
         * using the provided configuration, which will be used for microservices communication.
         */
        return ClientProxyFactory.create({
          // Indicates the transport layer is RabbitMQ, a popular choice for handling message-driven microservices.
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
            queue: QUEUE,
            // Ensures the RabbitMQ queue is durable, meaning it will survive broker restarts.
            queueOptions: { durable: true },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
/**
 * The AuthModule is a well-structured module in a NestJS application  that groups together authentication-related functionalities.
 * It uses the ConfigModule for application configuration, JwtModule for handling JWTs, and a shared module for common functionalities.
 * The module is set up for microservices architecture with RabbitMQ as the message broker,
 * indicated by the configuration in the providers array for the USER_SERVICE.
 * This setup allows the AuthController and AuthService to interact with other services in a decoupled and scalable manner.
 */
