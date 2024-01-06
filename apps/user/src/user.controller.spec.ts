import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedService } from '@app/shared';
import { RmqData } from '@app/shared/interfaces/rmq-data.interface';
import { EmailAndUsernameDto } from '@app/shared/dto/email-username.dto';
import { Channel, Message } from 'amqplib';
import { RabbitMQMessage } from '@app/shared/dto/rmq-event.dto';
import { User } from '@app/shared/interfaces/user.interface';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('UserController', () => {
  let userService: UserService;
  let sharedService: SharedService;
  let userController: UserController;
  let authService: ClientProxy;
  let userModel: Model<User>;

  beforeEach(async () => {
    authService = {
      send: jest.fn().mockImplementation(() => ({
        toPromise: jest.fn().mockResolvedValueOnce({}),
      })),
    } as any;
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        SharedService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              email: 'test@test.com',
              username: 'test',
            }),
          },
        },
        {
          provide: getModelToken('Profile'),
          useValue: {},
        },
        {
          provide: getModelToken('ZodiacEnd'),
          useValue: {},
        },
        { provide: 'AUTH_SERVICE', useValue: authService },
      ],
    }).compile();

    userService = app.get<UserService>(UserService);
    sharedService = app.get<SharedService>(SharedService);
    userController = app.get<UserController>(UserController);
    userModel = app.get<Model<User>>(getModelToken('User'));
  });

  describe('register', () => {
    it('should return user when findOneByEmailOrByUsername returns a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        username: 'test',
      } as User;
      const mockExtractData = {
        ack: jest.fn(),
        nack: jest.fn(),
        data: mockUser,
        channel: {} as Channel,
        message: {} as Message,
        event: {
          data: mockUser,
          pattern: 'find-user-by-email-or-username',
          id: '1',
        } as RabbitMQMessage<EmailAndUsernameDto>,
      } as RmqData<EmailAndUsernameDto>;
      const mockedContext = {} as RmqContext;

      jest.spyOn(sharedService, 'extractData').mockReturnValue(mockExtractData);
      jest
        .spyOn(userService, 'findOneByEmailOrByUsername')
        .mockResolvedValue(mockUser);
      const userModelSave = jest.fn().mockResolvedValue(mockUser);
      userModel.findOne = userModelSave;

      expect(await userController.register(mockedContext)).toBe(mockUser);
      expect(mockExtractData.ack).toHaveBeenCalled();
    });
  });
});
