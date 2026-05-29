import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SyncStatusEnum } from '../../../common/enums/database.enums';

export class CreateSyncHistoryDto {
  @IsOptional()
  @IsUUID()
  dataSourceId?: string;

  @IsOptional()
  @IsUUID()
  sourceSheetId?: string;

  @IsOptional()
  @IsUUID()
  sourceTableId?: string;

  @IsOptional()
  @IsUUID()
  viewId?: string;

  @IsOptional()
  @IsUUID()
  snapshotId?: string;

  @IsOptional()
  @IsEnum(SyncStatusEnum)
  syncStatus?: SyncStatusEnum;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;
}
