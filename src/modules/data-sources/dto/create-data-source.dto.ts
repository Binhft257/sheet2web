import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  SourceStatusEnum,
  SourceTypeEnum,
} from '../../../common/enums/database.enums';

export class CreateDataSourceDto {
  @IsUUID()
  ownerId!: string;

  @IsOptional()
  @IsEnum(SourceTypeEnum)
  sourceType?: SourceTypeEnum;

  @IsString()
  sourceUrl!: string;

  @IsOptional()
  @IsString()
  spreadsheetId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(SourceStatusEnum)
  sourceStatus?: SourceStatusEnum;

  @IsOptional()
  @IsObject()
  connectionMetaJson?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  lastSyncedStructureAt?: string;

  @IsOptional()
  @IsString()
  lastError?: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string;
}
