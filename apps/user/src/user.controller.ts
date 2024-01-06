import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { User } from '@app/shared/interfaces/user.interface';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { EmailAndUsernameDto } from '@app/shared/dto/email-username.dto';
import { SharedService } from '@app/shared';
import { ProfileAndUser } from '@app/shared/interfaces/profile-user.interface';
import { HoroscopeZodiac } from '@app/shared/interfaces/horoscope-zodiac.interface';
import { UpdateProfileDto } from 'apps/youapp-api/src/dto/update-profile.dto';
import { UpdatePassword } from './dto/update-password.dto';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern('find-user-by-email-or-username')
  async register(@Ctx() context: RmqContext): Promise<User | null> {
    const extractData =
      this.sharedService.extractData<EmailAndUsernameDto>(context);
    try {
      const result = await this.userService.findOneByEmailOrByUsername(
        extractData.data,
      );
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return null;
    }
  }

  @MessagePattern('create-user')
  async createUser(@Ctx() context: RmqContext) {
    const extractData = this.sharedService.extractData<CreateUserDto>(context);
    try {
      const result = await this.userService.create(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return null;
    }
  }

  @MessagePattern('get-profile-and-user')
  async getProfileAndUser(
    @Ctx() context: RmqContext,
  ): Promise<ProfileAndUser | null> {
    const extractData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.userService.getProfileAndUser(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return null;
    }
  }

  @MessagePattern('get-horoscope-zodiac')
  async getHoroscopeZodiac(
    @Ctx() context: RmqContext,
  ): Promise<HoroscopeZodiac | null> {
    const extractData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.userService.getHoroscopeZodiac(
        extractData.data,
      );
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return null;
    }
  }

  @MessagePattern('update-profile')
  async updateProfile(@Ctx() context: RmqContext) {
    const extractData = this.sharedService.extractData<
      UpdateProfileDto & HoroscopeZodiac & { userId: string }
    >(context);
    const toUpdate = { ...extractData.data };
    delete toUpdate.userId;

    try {
      const result = await this.userService.updateProfile(
        extractData.data.userId,
        toUpdate,
      );
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return false;
    }
  }

  @MessagePattern('get-all-profiles')
  async getAllProfile(@Ctx() context: RmqContext) {
    const extractData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.userService.findAllProfile(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return [];
    }
  }

  @MessagePattern('get-profile-names')
  async getProfiles(
    @Ctx() context: RmqContext,
  ): Promise<{ id: string; name: string }[]> {
    const extractData = this.sharedService.extractData<string[]>(context);
    try {
      const result: { id: string; name: string }[] =
        await this.userService.getProfileNames(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return [];
    }
  }

  @MessagePattern('update-password')
  async updatePassword(@Ctx() context: RmqContext) {
    const extractData = this.sharedService.extractData<UpdatePassword>(context);
    try {
      const result = await this.userService.updatePassword(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return false;
    }
  }

  @MessagePattern('is-userid-exist')
  async isUserIdExist(@Ctx() context: RmqContext) {
    const extractData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.userService.isUserIdExist(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return false;
    }
  }

  @MessagePattern('is-username-exist')
  async isUsernameExist(@Ctx() context: RmqContext) {
    const extractData = this.sharedService.extractData<string>(context);
    try {
      const result = await this.userService.isUsernameExist(extractData.data);
      extractData.ack();
      return result;
    } catch (error) {
      console.log(error);
      extractData.nack();
      return false;
    }
  }
}
