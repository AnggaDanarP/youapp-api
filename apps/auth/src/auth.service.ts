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

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}
  async register(createUserDto: CreateUserDto): Promise<ErrorData | boolean> {
    const user: User | null = await firstValueFrom(
      this.userService.send('find-user-by-email-or-username', {
        email: createUserDto.email,
        username: createUserDto.username,
      } as EmailAndUsernameDto),
    );
    if (user !== null) {
      return {
        statusCode: 2002,
        error: 'User already exists',
      };
    }
    const userId: string | null = await firstValueFrom(
      this.userService.send('create-user', createUserDto),
    );
    if (!userId || userId === null) {
      return {
        statusCode: 2003,
        error: 'User creation failed',
      };
    }
    return true;
  }

  async login(loginUserDto: LoginUserDto): Promise<Jwt | undefined> {
    const user = await this.validateUser(
      loginUserDto.usernameOrEmail,
      loginUserDto.password,
    );
    if (user === null) return undefined;
    const payload = { sub: user._id.toString() } satisfies JwtPayload;
    return this.generateJWT(payload);
  }

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

  async refresh(refreshToken: string): Promise<Jwt | undefined> {
    try {
      // check if refresh token have bearer prefix
      if (refreshToken.startsWith('Bearer ')) {
        refreshToken = refreshToken.split(' ')[1];
      } else {
        return undefined;
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );
      return this.generateJWT({ sub: payload.sub } satisfies JwtPayload);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async validateJwt(jwt: string): Promise<JwtPayload | undefined> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(jwt, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      const isUserExist: boolean = await firstValueFrom(
        this.userService.send('is-userid-exist', payload.sub),
      );
      if (!isUserExist) return undefined;
      return payload;
    } catch (error) {
      return undefined;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return Scrypt.hashPassword(password);
  }

  private async validateUser(
    emailOrUsername: string,
    password: string,
  ): Promise<User | null> {
    const user: User | null = await firstValueFrom(
      this.userService.send('find-user-by-email-or-username', {
        email: emailOrUsername,
        username: emailOrUsername,
      } as EmailAndUsernameDto),
    );
    if (user === null) return null;
    const isPasswordMatched = await Scrypt.verifyPassword(
      password,
      user.password,
    );
    if (isPasswordMatched) {
      const newPassword = await this.hashPassword(password);
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
