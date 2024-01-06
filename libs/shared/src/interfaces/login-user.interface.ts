import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  readonly usernameOrEmail!: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password!: string;
}
