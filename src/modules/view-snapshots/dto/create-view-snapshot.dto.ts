import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: '88dadab1-31a6-41b5-8e40-2c0c5047b0dc',
    description: 'ID của view.',
  })
  @IsUUID()
  viewId!: string;

  @ApiProperty({ example: 'v1', description: 'Số phiên bản của snapshot.' })
  @IsString()
  versionNo!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Cho biết snapshot này có phải bản hiện tại hay không.',
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiProperty({
    enum: SelectionTypeEnum,
    example: SelectionTypeEnum.RANGE,
    description: 'Kiểu vùng chọn đã được xác định.',
  })
  @IsEnum(SelectionTypeEnum)
  resolvedSelectionType!: SelectionTypeEnum;

  @ApiPropertyOptional({
    example: 'Sheet1',
    description: 'Tên sheet đã xác định tại thời điểm tạo snapshot.',
  })
  @IsOptional()
  @IsString()
  resolvedSheetNameSnapshot?: string;

  @ApiPropertyOptional({
    example: 'Orders',
    description: 'Tên bảng đã xác định tại thời điểm tạo snapshot.',
  })
  @IsOptional()
  @IsString()
  resolvedTableNameSnapshot?: string;

  @ApiPropertyOptional({
    example: 'Sheet1!A1:F100',
    description: 'Vùng A1 đã được xác định.',
  })
  @IsOptional()
  @IsString()
  resolvedRangeA1?: string;

  @ApiPropertyOptional({
    example: { sheetId: 0 },
    description: 'JSON metadata đã được xác định.',
  })
  @IsOptional()
  @IsObject()
  resolvedMetaJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['Name', 'Total'],
    description: 'Danh sách header của snapshot.',
  })
  @IsOptional()
  @IsArray()
  headersJson?: any[];

  @ApiPropertyOptional({
    example: [['Alice', 120]],
    description: 'Danh sách dòng dữ liệu của snapshot.',
  })
  @IsOptional()
  @IsArray()
  rowsJson?: any[];

  @ApiPropertyOptional({
    example: 100,
    description: 'Số dòng dữ liệu.',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  rowCount?: number;

  @ApiPropertyOptional({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm lấy dữ liệu nguồn.',
  })
  @IsOptional()
  @IsDateString()
  fetchedAt?: string;

  @ApiPropertyOptional({
    example: 'rev-123',
    description: 'Phiên bản dữ liệu nguồn tương ứng với snapshot.',
  })
  @IsOptional()
  @IsString()
  sourceRevision?: string;

  @ApiPropertyOptional({
    example: 'sha256:abcdef',
    description: 'Hash của dữ liệu snapshot.',
  })
  @IsOptional()
  @IsString()
  dataHash?: string;

  @ApiPropertyOptional({
    enum: SyncStatusEnum,
    example: SyncStatusEnum.SUCCESS,
    description: 'Trạng thái đồng bộ của snapshot.',
  })
  @IsOptional()
  @IsEnum(SyncStatusEnum)
  syncStatus?: SyncStatusEnum;

  @ApiPropertyOptional({
    example: 'Failed to fetch range',
    description: 'Chi tiết lỗi đồng bộ.',
  })
  @IsOptional()
  @IsString()
  syncError?: string;
}
