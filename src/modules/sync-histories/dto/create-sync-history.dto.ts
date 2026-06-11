import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    example: 'c26ee66c-dd55-430c-8eb8-47c7f6d51a3d',
    description: 'ID nguồn dữ liệu.',
  })
  @IsOptional()
  @IsUUID()
  dataSourceId?: string;

  @ApiPropertyOptional({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    description: 'ID source sheet.',
  })
  @IsOptional()
  @IsUUID()
  sourceSheetId?: string;

  @ApiPropertyOptional({
    example: '012bc5a6-9530-4a95-89d7-b2fb2211dd45',
    description: 'Source table id.',
  })
  @IsOptional()
  @IsUUID()
  sourceTableId?: string;

  @ApiPropertyOptional({
    example: '88dadab1-31a6-41b5-8e40-2c0c5047b0dc',
    description: 'ID của view.',
  })
  @IsOptional()
  @IsUUID()
  viewId?: string;

  @ApiPropertyOptional({
    example: 'f77c3eb0-81fb-4017-a348-e859f4d19371',
    description: 'ID của snapshot view.',
  })
  @IsOptional()
  @IsUUID()
  snapshotId?: string;

  @ApiPropertyOptional({
    enum: SyncStatusEnum,
    example: SyncStatusEnum.SUCCESS,
    description: 'Trạng thái đồng bộ.',
  })
  @IsOptional()
  @IsEnum(SyncStatusEnum)
  syncStatus?: SyncStatusEnum;

  @ApiPropertyOptional({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm bắt đầu đồng bộ.',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({
    example: '2026-06-10T10:01:00.000Z',
    description: 'Thời điểm kết thúc đồng bộ.',
  })
  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @ApiPropertyOptional({
    example: 'Google API timeout',
    description: 'Thông báo lỗi đồng bộ.',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    example: { rows: 120 },
    description: 'Metadata bổ sung của lần đồng bộ.',
  })
  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;
}
