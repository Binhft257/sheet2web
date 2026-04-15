import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  AccessModeEnum,
  SelectionTypeEnum,
  ViewStatusEnum,
} from '../../../common/enums/database.enums';

export class CreateViewDto {
  @IsUUID()
  ownerId!: string;

  @IsUUID()
  dataSourceId!: string;

  @ValidateIf(
    (o) =>
      o.selectionType === SelectionTypeEnum.FULL_SHEET ||
      o.selectionType === SelectionTypeEnum.RANGE,
  )
  @IsUUID()
  sourceSheetId?: string;

  @ValidateIf((o) => o.selectionType === SelectionTypeEnum.TABLE)
  @IsUUID()
  sourceTableId?: string;

  @IsOptional()
  @IsUUID()
  themeId?: string;

  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsEnum(AccessModeEnum)
  accessMode?: AccessModeEnum;

  @IsOptional()
  @IsEnum(ViewStatusEnum)
  status?: ViewStatusEnum;

  @IsOptional()
  @IsEnum(SelectionTypeEnum)
  selectionType?: SelectionTypeEnum;

  @ValidateIf((o) => o.selectionType === SelectionTypeEnum.RANGE)
  @IsString()
  rangeA1Notation?: string;

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
  @IsObject()
  themeOverrideJson?: Record<string, any>;

  @IsOptional()
  @IsObject()
  settingsJson?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  lastPublishedAt?: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string;
}
