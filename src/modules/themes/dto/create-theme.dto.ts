import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ThemeScopeEnum } from '../../../common/enums/database.enums';

export class CreateThemeDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(ThemeScopeEnum)
  scope?: ThemeScopeEnum;

  @IsOptional()
  @IsObject()
  configJson?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  deletedAt?: string;
}
