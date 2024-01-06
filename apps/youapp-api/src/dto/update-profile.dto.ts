import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsString()
  readonly birthday?: string;

  @IsOptional()
  @IsBoolean()
  readonly gender?: boolean;

  @IsOptional()
  @IsNumber()
  readonly heightInCm?: string;

  @IsOptional()
  @IsNumber()
  readonly weightInKg?: number;

  @IsOptional()
  @IsArray()
  readonly interests?: string[];
}
