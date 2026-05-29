import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { AccessModeEnum, SelectionTypeEnum } from '../../../common/enums/database.enums';

export class UpdateViewDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  sourceSheetId?: string | null;

  @IsOptional()
  @IsEnum(SelectionTypeEnum)
  selectionType?: SelectionTypeEnum;

  @IsOptional()
  @IsString()
  rangeA1Notation?: string | null;

  @IsOptional()
  @IsEnum(AccessModeEnum)
  accessMode?: AccessModeEnum;

  @IsOptional()
  @IsBoolean()
  useFirstRowAsHeader?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  refreshIntervalSeconds?: number;

  @IsOptional()
  @IsBoolean()
  allowThemeSwitch?: boolean;

  @IsOptional()
  @IsUUID()
  themeId?: string | null;

  @IsOptional()
  @IsObject()
  themeOverrideJson?: Record<string, any>;

  @IsOptional()
  @IsObject()
  settingsJson?: Record<string, any>;
}
