import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    description: 'ID của view.',
  })
  @IsUUID()
  viewId!: string;

  @ApiProperty({
    example: '1c6b3bd0-f578-4b8f-a381-dbb66c8ddf74',
    description: 'ID của source sheet.',
  })
  @IsUUID()
  sourceSheetId!: string;

  @ApiPropertyOptional({
    example: '012bc5a6-9530-4a95-89d7-b2fb2211dd45',
    description: 'ID của source table.',
  })
  @IsOptional()
  @IsUUID()
  sourceTableId?: string;

  @ApiPropertyOptional({
    example: '9d1723de-1471-41b8-84f2-bcf9c0640c80',
    description: 'ID người dùng đã yêu cầu thay đổi.',
  })
  @IsOptional()
  @IsUUID()
  changedBy?: string;

  @ApiPropertyOptional({
    example: '963082ef-72d1-44e4-a3db-11f2825328c8',
    description: 'ID batch dùng để nhóm các thay đổi.',
  })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiPropertyOptional({
    enum: ChangeStatusEnum,
    example: ChangeStatusEnum.PENDING,
    description: 'Trạng thái yêu cầu thay đổi.',
  })
  @IsOptional()
  @IsEnum(ChangeStatusEnum)
  requestStatus?: ChangeStatusEnum;

  @ApiPropertyOptional({
    example: 2,
    description: 'Chỉ số dòng, bắt đầu từ 1.',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rowIndex?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Chỉ số cột, bắt đầu từ 1.',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  columnIndex?: number;

  @ApiProperty({ example: 'C2', description: 'Địa chỉ ô theo định dạng A1.' })
  @IsString()
  cellAddress!: string;

  @ApiPropertyOptional({
    example: 'Giá trị cũ',
    description: 'Giá trị trước đó của ô.',
  })
  @IsOptional()
  @IsString()
  oldValue?: string;

  @ApiPropertyOptional({
    example: 'Giá trị mới',
    description: 'Giá trị mới được yêu cầu cập nhật.',
  })
  @IsOptional()
  @IsString()
  newValue?: string;

  @ApiPropertyOptional({
    example: 'rev-123',
    description: 'Phiên bản dữ liệu nguồn trước hoặc sau thay đổi.',
  })
  @IsOptional()
  @IsString()
  sourceRevision?: string;

  @ApiPropertyOptional({
    example: 'Xác thực dữ liệu thất bại',
    description: 'Thông báo lỗi nếu áp dụng thay đổi thất bại.',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    example: { reason: 'manual edit' },
    description: 'Metadata bổ sung.',
  })
  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm yêu cầu thay đổi.',
  })
  @IsOptional()
  @IsDateString()
  changedAt?: string;

  @ApiPropertyOptional({
    example: '2026-06-10T10:01:00.000Z',
    description: 'Thời điểm thay đổi được áp dụng.',
  })
  @IsOptional()
  @IsDateString()
  appliedAt?: string;
}
