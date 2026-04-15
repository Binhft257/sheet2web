import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSourceTableDto {
  @IsUUID()
  dataSourceId!: string;

  @IsUUID()
  sourceSheetId!: string;

  @IsString()
  googleTableId!: string;

  @IsString()
  tableName!: string;

  @IsInt()
  @Min(0)
  startRowIndex!: number;

  @IsInt()
  @Min(0)
  endRowIndex!: number;

  @IsInt()
  @Min(0)
  startColumnIndex!: number;

  @IsInt()
  @Min(0)
  endColumnIndex!: number;

  @IsOptional()
  @IsString()
  rangeA1Notation?: string;

  @IsOptional()
  @IsBoolean()
  hasHeader?: boolean;

  @IsOptional()
  @IsBoolean()
  hasFooter?: boolean;

  @IsOptional()
  @IsObject()
  rowsPropertiesJson?: Record<string, any>;

  @IsOptional()
  @IsArray()
  columnPropertiesJson?: any[];

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  lastSyncedAt?: string;
}
