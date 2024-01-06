import { Test, TestingModule } from '@nestjs/testing';
import { SharedService } from '@app/shared';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { RmqData } from '@app/shared/interfaces/rmq-data.interface';
import { LoginUserDto } from '@app/shared/interfaces/login-user.interface';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { Jwt } from './interfaces/jwtToken.interface';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let sharedService: SharedService;
  let authService: AuthService;
  let userService: ClientProxy;

  beforeEach(async () => {
    userService = {
      send: jest.fn().mockImplementation(() => ({
        toPromise: jest.fn().mockResolvedValueOnce({}),
      })),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [JwtModule.register({})],
      providers: [
        SharedService,
        AuthService,
        { provide: 'USER_SERVICE', useValue: userService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    sharedService = module.get<SharedService>(SharedService);
  });

  it('should register a user', async () => {
    const context = {} as RmqContext;
    const extractedData: RmqData<CreateUserDto> = {
      data: { username: 'test', password: 'test', email: 'email@test.id' },
      ack: jest.fn(),
      nack: jest.fn(),
      channel: null,
      message: null,
      event: null,
    };
    jest.spyOn(sharedService, 'extractData').mockReturnValue(extractedData);
    jest.spyOn(authService, 'register').mockResolvedValue(true);

    expect(await authController.register(context)).toBe(true);
    expect(extractedData.ack).toHaveBeenCalled();
  });

  it('should login a user', async () => {
    const context = {} as RmqContext;
    const extractedData: RmqData<LoginUserDto> = {
      data: { usernameOrEmail: 'test', password: 'test' },
      ack: jest.fn(),
      nack: jest.fn(),
      channel: null,
      message: null,
      event: null,
    };
    const jwt: Jwt = { accessToken: 'test', refreshToken: 'test' };
    jest.spyOn(sharedService, 'extractData').mockReturnValue(extractedData);
    jest.spyOn(authService, 'login').mockResolvedValue(jwt);

    expect(await authController.login(context)).toEqual(jwt);
    expect(extractedData.ack).toHaveBeenCalled();
  });
});
