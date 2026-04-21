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
