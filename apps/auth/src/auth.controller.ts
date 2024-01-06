import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { ErrorData } from '@app/shared/interfaces/error-data.interface';
import { LoginUserDto } from '@app/shared/interfaces/login-user.interface';
import { Jwt, JwtPayload } from './interfaces/jwtToken.interface';
import { SharedService } from '@app/shared';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}

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
