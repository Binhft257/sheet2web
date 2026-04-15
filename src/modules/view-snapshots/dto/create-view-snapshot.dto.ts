import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  SelectionTypeEnum,
  SyncStatusEnum,
} from '../../../common/enums/database.enums';

export class CreateViewSnapshotDto {
  @IsUUID()
  viewId!: string;

  @IsString()
  versionNo!: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsEnum(SelectionTypeEnum)
  resolvedSelectionType!: SelectionTypeEnum;

  @IsOptional()
  @IsString()
  resolvedSheetNameSnapshot?: string;

  @IsOptional()
  @IsString()
  resolvedTableNameSnapshot?: string;

  @IsOptional()
  @IsString()
  resolvedRangeA1?: string;

  @IsOptional()
  @IsObject()
  resolvedMetaJson?: Record<string, any>;

  @IsOptional()
  @IsArray()
  headersJson?: any[];

  @IsOptional()
  @IsArray()
  rowsJson?: any[];

  @IsOptional()
  @IsInt()
  @Min(0)
  rowCount?: number;

  @IsOptional()
  @IsDateString()
  fetchedAt?: string;

  @IsOptional()
  @IsString()
  sourceRevision?: string;

  @IsOptional()
  @IsString()
  dataHash?: string;

  @IsOptional()
  @IsEnum(SyncStatusEnum)
  syncStatus?: SyncStatusEnum;

  @IsOptional()
  @IsString()
  syncError?: string;
}
