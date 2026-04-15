import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ChangeStatusEnum } from '../../../common/enums/database.enums';

export class CreateCellChangeLogDto {
  @IsUUID()
  viewId!: string;

  @IsUUID()
  sourceSheetId!: string;

  @IsOptional()
  @IsUUID()
  sourceTableId?: string;

  @IsOptional()
  @IsUUID()
  changedBy?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsEnum(ChangeStatusEnum)
  requestStatus?: ChangeStatusEnum;

  @IsOptional()
  @IsInt()
  @Min(1)
  rowIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  columnIndex?: number;

  @IsString()
  cellAddress!: string;

  @IsOptional()
  @IsString()
  oldValue?: string;

  @IsOptional()
  @IsString()
  newValue?: string;

  @IsOptional()
  @IsString()
  sourceRevision?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  changedAt?: string;

  @IsOptional()
  @IsDateString()
  appliedAt?: string;
}
