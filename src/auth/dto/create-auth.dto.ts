import { Optional } from '@nestjs/common';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserStatusEnum } from '../../common/enums/database.enums';

export class CreateAuthDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  passwordHash!: string;

  @IsNotEmpty()
  @IsString()
  fullName!: string;
}

export class CheckCodeDto {
  @IsNotEmpty({ message: 'ID is required' })
  id!: string;

  @IsNotEmpty({ message: 'Code is required' })
  code!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'ID is required' })
  id!: string;

  @IsNotEmpty({ message: 'Code is required' })
  code!: string;

  @IsNotEmpty()
  @IsString()
  passwordHash!: string;
}
