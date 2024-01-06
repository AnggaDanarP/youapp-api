import { IsNotEmpty } from 'class-validator';

export class BirthdayDto {
  @IsNotEmpty()
  readonly birthday!: string;
}
