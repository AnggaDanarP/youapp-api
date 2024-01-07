/**
 * DTOs (Data Transfer Objects) and interfaces are imported,
 * which are used to transfer data between different parts of the application.
 */
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { EmailAndUsernameDto } from '@app/shared/dto/email-username.dto';
import { ErrorData } from '@app/shared/interfaces/error-data.interface';
import { User } from '@app/shared/interfaces/user.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginUserDto } from '@app/shared/interfaces/login-user.interface';
import { Jwt, JwtPayload } from './interfaces/jwtToken.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdatePassword } from 'apps/user/src/dto/update-password.dto';
import { Scrypt } from '@app/shared/scrypt';

/**
 * The service appears to be handling authentication-related operations
 * such as user registration, login, token generation and validation, and password hashing.
 */
@Injectable()
export class AuthService {
  constructor(
    /**
     * @Injectable(), indicating that it can be injected as a dependency in other parts of the application.
     */
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param createUserDto
   * Registers a new user.
   * It first checks if the user exists using the userService proxy, and if not, creates a new user.
   * @returns a boolean indicating success or an error object.
   */
  async register(createUserDto: CreateUserDto): Promise<ErrorData | boolean> {
    // find user by email and username
    const user: User | null = await firstValueFrom(
      this.userService.send('find-user-by-email-or-username', {
        email: createUserDto.email,
        username: createUserDto.username,
      } as EmailAndUsernameDto),
    );
    // check if user is already register or not
    if (user !== null) {
      return {
        statusCode: 2002,
        error: 'User already exists',
      };
    }
    // create new user
    const userId: string | null = await firstValueFrom(
      this.userService.send('create-user', createUserDto),
    );
    // checking from creating process is success
    if (!userId || userId === null) {
      return {
        statusCode: 2003,
        error: 'User creation failed',
      };
    }
    return true;
  }

  /**
   *
   * @param loginUserDto
   * Authenticates a user and Validates the user.
   * @returns if successful, generates and returns a JWT.
   */
  async login(loginUserDto: LoginUserDto): Promise<Jwt | undefined> {
    // validating process
    const user = await this.validateUser(
      loginUserDto.usernameOrEmail,
      loginUserDto.password,
    );
    if (user === null) return undefined;
    // generate JWT and return it
    const payload = { sub: user._id.toString() } satisfies JwtPayload;
    return this.generateJWT(payload);
  }

  /**
   *
   * @param payload
   * Generates JWT tokens (access and refresh) based on the provided payload.
   * @returns access token and refresh token
   */
  async generateJWT(payload: JwtPayload): Promise<Jwt> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '3m',
        secret: process.env.JWT_ACCESS_SECRET,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    ]);
    return { accessToken, refreshToken } satisfies Jwt;
  }

  /**
   *
   * @param refreshToken
   * Refreshes the JWT. Verifies the refresh token and generates a new JWT.
   * @returns
   */
  async refresh(refreshToken: string): Promise<Jwt | undefined> {
    try {
      // check if refresh token have bearer prefix
      if (refreshToken.startsWith('Bearer ')) {
        refreshToken = refreshToken.split(' ')[1];
      } else {
        return undefined;
      }
      // verify the JWT token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );
      // generate JWT token
      return this.generateJWT({ sub: payload.sub } satisfies JwtPayload);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  /**
   *
   * @param jwt
   * Validates a JWT and checks if the user exists.
   * @returns the payload if valid, or undefined if not.
   */
  async validateJwt(jwt: string): Promise<JwtPayload | undefined> {
    try {
      // verify the JWT token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(jwt, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      // check if user exist or not
      const isUserExist: boolean = await firstValueFrom(
        this.userService.send('is-userid-exist', payload.sub),
      );
      if (!isUserExist) return undefined;
      return payload;
    } catch (error) {
      return undefined;
    }
  }

  /**
   *
   * @param password
   * Hashes a password using the Scrypt utility.
   * @returns string hash
   */
  async hashPassword(password: string): Promise<string> {
    return Scrypt.hashPassword(password);
  }

  /**
   *
   * @param emailOrUsername
   * @param password
   * Checks if the user exists and if the password matches.
   * It also hashes the new password and updates it.
   * @returns the user if successful or null if not.
   */
  private async validateUser(
    emailOrUsername: string,
    password: string,
  ): Promise<User | null> {
    // find user by email or username
    const user: User | null = await firstValueFrom(
      this.userService.send('find-user-by-email-or-username', {
        email: emailOrUsername,
        username: emailOrUsername,
      } as EmailAndUsernameDto),
    );
    if (user === null) return null;
    // verifying the password
    const isPasswordMatched = await Scrypt.verifyPassword(
      password,
      user.password,
    );
    if (isPasswordMatched) {
      // generate new password
      const newPassword = await this.hashPassword(password);
      // update new password
      const result: boolean = await firstValueFrom(
        this.userService.send('update-password', {
          userId: user._id,
          password: newPassword,
        } as UpdatePassword),
      );
      return result ? user : null;
    } else {
      return null;
    }
  }
}
/**
 * This AuthService class demonstrates a comprehensive approach to handling authentication in a microservices architecture using NestJS.
 * It encapsulates the logic for user registration, authentication, JWT management, and password handling,
 * showcasing good practices in handling communication between services, error management, and security considerations in authentication workflows.
 */
