import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ServerResponse } from './dto/server-response.dto';
import { ErrorData } from '@app/shared/interfaces/error-data.interface';
import { LoginUserDto } from '@app/shared/interfaces/login-user.interface';
import { Jwt, JwtPayload } from 'apps/auth/src/interfaces/jwtToken.interface';
import { AuthRequest } from '@app/shared/types/auth-request.type';
import { AuthGuard } from './auth-guard';
import {
  Profile,
  ProfileDocument,
} from 'apps/user/src/interfaces/profile.interface';
import { ProfileAndUser } from '@app/shared/interfaces/profile-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { HoroscopeZodiac } from '../../../libs/shared/src/interfaces/horoscope-zodiac.interface';
import { BirthdayDto } from './dto/birthday.dto';

@Controller('api')
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Post('register')
  async register(
    @Res() res: Response,
    @Body() createUserDto: CreateUserDto,
  ): Promise<Response> {
    const result: boolean | ErrorData = await firstValueFrom(
      this.authService.send('register', createUserDto),
    );
    if ((result as ErrorData).statusCode) {
      return this.buildErrorReponse(
        res,
        (result as ErrorData).statusCode,
        (result as ErrorData).error,
      );
    } else {
      return res.status(201).send();
    }
  }

  @Post('login')
  async login(
    @Res() res: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Response> {
    const jwt = await firstValueFrom(
      this.authService.send('login', loginUserDto),
    );
    const isJwtValid = jwt !== null;
    return res.status(!jwt ? 400 : 200).json({
      isOk: isJwtValid,
      message: !isJwtValid ? 'Invalid username, email or password' : undefined,
      errorCode: !isJwtValid ? 2004 : undefined,
      data: !isJwtValid ? undefined : jwt,
    } satisfies ServerResponse<Jwt>);
  }

  @Get('getProfile')
  @UseGuards(AuthGuard)
  async getProfile(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<Response> {
    const jwtPayload: JwtPayload = req.payload;
    const { profile, user }: ProfileAndUser = await firstValueFrom(
      this.userService.send('get-profile-and-user', jwtPayload.sub),
    );
    const response: ServerResponse<Profile> = {
      isOk: profile !== null && user !== null,
      ...(profile === null || user === null
        ? {
            errorCode: 1000,
            message: `Profile not found`,
          }
        : { data: this.sanitizeProfile(profile, user?.username) }),
    };
    return res.status(profile === null ? 404 : 201).json(response);
  }

  @Put('updateProfile')
  @UseGuards(AuthGuard)
  async update(
    @Req() req: AuthRequest,
    @Res() res: Response,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Response> {
    const jwtPayload = req.payload;
    let toupdate: UpdateProfileDto & HoroscopeZodiac = updateProfileDto;
    if (Object.keys(toupdate).length === 0) return res.status(200).send();
    if (updateProfileDto.birthday) {
      if (!/^\d{4}-\d{2}-\d{2}$/.exec(updateProfileDto.birthday)) {
        return res.status(400).json({
          isOk: false,
          errorCode: 1003,
          message: 'Birthday is not in the format of YYYY-MM-DD',
        });
      }
      const result = await this.getHoroscopeZodiac(updateProfileDto.birthday);
      toupdate = {
        ...updateProfileDto,
        horoscope: result?.horoscope,
        zodiac: result?.zodiac,
      };
    }
    const isOk: boolean = await firstValueFrom(
      this.userService.send('update-profile', {
        userId: jwtPayload.sub,
        ...toupdate,
      } as UpdateProfileDto & HoroscopeZodiac & { userId: string }),
    );
    return res.status(isOk ? 200 : 400).send();
  }

  @Post('askHoroscopeZodiac')
  async askHoroscopeZodiac(
    @Res() res: Response,
    @Body() body: BirthdayDto,
  ): Promise<Response> {
    if (!body.birthday) {
      return res.status(400).json({
        isOk: false,
        errorCode: 1004,
        message: 'Birthday is required',
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.exec(body.birthday)) {
      return res.status(400).json({
        isOk: false,
        errorCode: 1005,
        message: 'Birthday is not in the format of YYYY-MM-DD',
      });
    }
    const result = await this.getHoroscopeZodiac(body.birthday);
    if (result === null) {
      return res.status(500).json({
        isOk: false,
        errorCode: 1006,
        message: 'Failed to get horoscope and/or zodiac',
      });
    }
    const response: ServerResponse<{ horoscope: string; zodiac: string }> = {
      isOk: true,
      data: {
        horoscope: result.horoscope,
        zodiac: result.zodiac,
      },
    };
    return res.status(200).json(response);
  }

  @Get('profiles')
  @UseGuards(AuthGuard)
  async getAllProfile(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<Response> {
    const jwtPayload = req.payload;
    let profiles: Profile[] = await firstValueFrom(
      this.userService.send('get-all-profiles', jwtPayload.sub),
    );
    profiles = profiles.filter((profile) => profile.name !== undefined);
    const response: ServerResponse<Profile[]> = {
      isOk: true,
      data: profiles,
    };

    return res.status(200).json(response);
  }

  @Get('refresh')
  async refreshToken(
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<Response> {
    const jwt = await firstValueFrom(
      this.authService.send('refresh', req.headers['x-refresh-token']),
    );
    const isJwtValid = jwt !== null;
    return res.status(!jwt ? 401 : 200).json({
      isOk: isJwtValid,
      message: !isJwtValid ? 'Invalid refresh token' : undefined,
      errorCode: !isJwtValid ? 2005 : undefined,
      data: !isJwtValid ? undefined : jwt,
    } satisfies ServerResponse<Jwt>);
  }

  @Post('isUsernameExist')
  async isUsernameExist(
    @Body() data: { username: string },
    @Res() res: Response,
  ): Promise<Response> {
    const result: boolean = await firstValueFrom(
      this.userService.send('is-username-exist', data.username),
    );
    return res.status(200).json({
      isOk: true,
      data: result,
    } satisfies ServerResponse<boolean>);
  }

  private getHoroscopeZodiac(
    birthday: string,
  ): Promise<HoroscopeZodiac | null> {
    return firstValueFrom(
      this.userService.send('get-horoscope-zodiac', birthday),
    );
  }

  private buildErrorReponse(
    res: Response,
    errorCode: number,
    message: string,
  ): Response {
    return res.status(500).json({
      isOk: false,
      errorCode,
      message,
    } satisfies ServerResponse<unknown>);
  }

  private sanitizeProfile(data: ProfileDocument, username: string): Profile {
    const {
      _id,
      name,
      birthday,
      heightInCm,
      weightInKg,
      gender,
      interests,
      zodiac,
      horoscope,
    } = data;
    const tempdata = {
      pId: _id,
      name,
      birthday,
      username,
      heightInCm,
      weightInKg,
      gender,
      interests,
      zodiac,
      horoscope,
    };
    if (tempdata.interests?.length === 0) delete tempdata.interests;
    return tempdata;
  }
}
