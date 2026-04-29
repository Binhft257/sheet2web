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

export class CreateViewDto {
  @IsUUID()
  dataSourceId!: string;

  @IsOptional()
  @IsUUID()
  sourceSheetId?: string | null;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(SelectionTypeEnum)
  selectionType!: SelectionTypeEnum;

  @IsOptional()
  @IsString()
  rangeA1Notation?: string;

  @IsEnum(AccessModeEnum)
  accessMode!: AccessModeEnum;

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
