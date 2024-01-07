import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { ErrorData } from '@app/shared/interfaces/error-data.interface';
import { LoginUserDto } from '@app/shared/interfaces/login-user.interface';
import { Jwt, JwtPayload } from './interfaces/jwtToken.interface';
import { SharedService } from '@app/shared';

/**
 * part of a NestJS application structured for microservices communication.
 * This class is responsible for handling authentication-related operations
 */
@Controller() // responsible for handling incoming request
export class AuthController {
  constructor(
    private readonly authService: AuthService, // containing the business logic related to authentication.
    private readonly sharedService: SharedService, //provide shared utilities or functions used across different parts of the application.
  ) {}

  /**
   * Each method in the controller is decorated with @MessagePattern
   * indicating that they respond to specific message patterns in a microservices environment,
   * likely involving communication with a message broker like RabbitMQ.
   */

  /**
   *
   * @param context
   * Responds to the 'register' message pattern.
   * It extracts user registration data, attempts to register a new user,
   * and acknowledges or does not acknowledge the message depending on the operation's success.
   * @returns a boolean indicating success or an ErrorData object if there's an error.
   */
  @MessagePattern('register')
  async register(@Ctx() context: RmqContext): Promise<boolean | ErrorData> {
    const extractedData =
      this.sharedService.extractData<CreateUserDto>(context);
    try {
      const result = await this.authService.register(extractedData.data);
      extractedData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractedData.nack();
      return false;
    }
  }

  /**
   *
   * @param context
   * Handles the 'login' message pattern.
   * Extracts login data, performs the login operation, and acknowledges the message.
   * @returns a Jwt object if successful, or null if not.
   */
  @MessagePattern('login')
  async login(@Ctx() context: RmqContext): Promise<Jwt | null> {
    const extractedData = this.sharedService.extractData<LoginUserDto>(context);
    try {
      const result = await this.authService.login(extractedData.data);
      extractedData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractedData.nack();
      return null;
    }
  }

  /**
   *
   * @param context
   * Responds to the 'refresh' message pattern for JWT token refresh requests.
   * @returns a new Jwt object or null in case of failure.
   */
  @MessagePattern('refresh')
  async refresh(@Ctx() context: RmqContext): Promise<Jwt | null> {
    const extractedData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.authService.refresh(extractedData.data);
      extractedData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractedData.nack();
      return null;
    }
  }

  /**
   *
   * @param context
   * For the 'hash-password' message pattern,
   * it extracts the password data, hashes it, and acknowledges the message.
   * @returns the hashed password or null.
   */
  @MessagePattern('hash-password')
  async hashPassword(@Ctx() context: RmqContext): Promise<string | null> {
    const extractedData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.authService.hashPassword(extractedData.data);
      extractedData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractedData.nack();
      return null;
    }
  }

  /**
   *
   * @param context
   * Handles the 'validate' message pattern, likely for JWT validation.
   * @returns the JwtPayload if validation is successful, or null otherwise.
   */
  @MessagePattern('validate')
  async validate(@Ctx() context: RmqContext): Promise<JwtPayload | null> {
    const extractedData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.authService.validateJwt(extractedData.data);
      extractedData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractedData.nack();
      return null;
    }
  }
}
/**
 * The AuthController class is designed to handle authentication-related operations in a NestJS-based microservices architecture.
 * It leverages message patterns for communication, indicating integration with a message broker system.
 * The controller encapsulates functionalities for user registration, login, token management, password hashing, and JWT validation,
 * showcasing good practices in microservices communication, error management, and authentication processes.
 */
