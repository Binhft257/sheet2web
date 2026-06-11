import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'c26ee66c-dd55-430c-8eb8-47c7f6d51a3d',
    description: 'ID nguồn dữ liệu.',
  })
  @IsUUID()
  dataSourceId!: string;

  @ApiProperty({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    description: 'ID source sheet.',
  })
  @IsUUID()
  sourceSheetId!: string;

  @ApiProperty({ example: 'tbl_123', description: 'ID bảng Google.' })
  @IsString()
  googleTableId!: string;

  @ApiProperty({
    example: 'Orders',
    description: 'Tên bảng được phát hiện hoặc được cấu hình.',
  })
  @IsString()
  tableName!: string;

  @ApiProperty({
    example: 0,
    description: 'Chỉ số dòng bắt đầu, tính từ 0.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  startRowIndex!: number;

  @ApiProperty({
    example: 99,
    description: 'Chỉ số dòng kết thúc, tính từ 0.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  endRowIndex!: number;

  @ApiProperty({
    example: 0,
    description: 'Chỉ số cột bắt đầu, tính từ 0.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  startColumnIndex!: number;

  @ApiProperty({
    example: 5,
    description: 'Chỉ số cột kết thúc, tính từ 0.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  endColumnIndex!: number;

  @ApiPropertyOptional({
    example: 'Sheet1!A1:F100',
    description: 'Vùng bảng theo định dạng A1.',
  })
  @IsOptional()
  @IsString()
  rangeA1Notation?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Cho biết bảng có dòng tiêu đề hay không.',
  })
  @IsOptional()
  @IsBoolean()
  hasHeader?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Cho biết bảng có dòng chân hay không.',
  })
  @IsOptional()
  @IsBoolean()
  hasFooter?: boolean;

  @ApiPropertyOptional({
    example: { frozen: true },
    description: 'JSON thuộc tính của dòng.',
  })
  @IsOptional()
  @IsObject()
  rowsPropertiesJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: [{ name: 'Total', type: 'number' }],
    description: 'JSON thuộc tính của cột.',
  })
  @IsOptional()
  @IsArray()
  columnPropertiesJson?: any[];

  @ApiPropertyOptional({
    example: { detectedBy: 'google' },
    description: 'Metadata bổ sung.',
  })
  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm đồng bộ gần nhất.',
  })
  @IsOptional()
  @IsDateString()
  lastSyncedAt?: string;
}
